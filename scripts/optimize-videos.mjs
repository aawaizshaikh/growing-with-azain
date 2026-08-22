/**
 * ============================================================================
 * AZAIN — ADAPTIVE VIDEO OPTIMIZER
 * ============================================================================
 *
 * ALL CURRENT VIDEOS
 *
 * PURPOSE:
 *   Optimize every video currently present in the Supabase
 *   Storage "timeline" bucket.
 *
 * TARGET:
 *   Approximately 40% of the original file size
 *   (~60% storage reduction).
 *
 * ENCODER:
 *   Intel Quick Sync H.264 (h264_qsv)
 *
 * IMPORTANT:
 *   - Processes one video at a time.
 *   - Preserves existing Storage path.
 *   - Preserves existing file extension.
 *   - Preserves effective visual resolution.
 *   - Preserves frame rate.
 *   - Uses adaptive per-video bitrate.
 *   - Verifies optimized file before replacement.
 *   - Never deletes an original before successful upload.
 *   - Never replaces a video with a larger file.
 *   - Does not modify database records.
 *   - Does not modify React/application code.
 *   - Can resume after interruption.
 *
 * SPECIAL HANDLING:
 *   Some portrait videos are physically stored as:
 *
 *       848x480
 *
 *   with rotation metadata, while their effective display
 *   orientation is portrait.
 *
 *   FFmpeg may normalize these during encoding to:
 *
 *       480x848
 *
 *   This is an orientation-equivalent transformation and
 *   is therefore accepted by validation.
 *
 * SAFETY:
 *   Original Storage object remains untouched until:
 *
 *      download
 *        ↓
 *      FFprobe
 *        ↓
 *      encode
 *        ↓
 *      validate
 *        ↓
 *      verify smaller
 *        ↓
 *      upload
 *        ↓
 *      verify remote object
 *
 *   Only then is the existing Storage object replaced.
 * ============================================================================
 */

import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { createClient } from "@supabase/supabase-js";

const execFileAsync = promisify(execFile);

/* ==========================================================================
   CONFIGURATION
   ========================================================================== */

const BUCKET = "timeline";

/*
 * Target percentage of original file size.
 *
 * 0.40 = approximately 40% of original
 *       = approximately 60% reduction.
 */
const TARGET_SIZE_RATIO = 0.40;

/*
 * Audio bitrate.
 *
 * 96 kbps is sufficient for typical family-memory
 * videos and leaves more of the target size available
 * for the video stream.
 */
const AUDIO_BITRATE_KBPS = 96;

/*
 * Minimum useful video bitrate.
 *
 * We do not want extremely low bitrates that would
 * unnecessarily damage visual quality.
 */
const MIN_VIDEO_BITRATE_KBPS = 400;

/*
 * Maximum video bitrate.
 *
 * This prevents an unusually large source bitrate from
 * producing an unnecessarily large output.
 *
 * This is deliberately generous for 1080p family videos.
 */
const MAX_VIDEO_BITRATE_KBPS = 12000;

/*
 * QSV rate-control mode.
 */
const QSV_RATE_CONTROL = "vbr";

/*
 * Temporary directory.
 */
const TEMP_DIR = path.join(
  process.cwd(),
  "scripts",
  ".video-optimization-tmp"
);

/*
 * Persistent progress file.
 *
 * This allows the script to resume if the PC is
 * restarted or the process is interrupted.
 */
const PROGRESS_FILE = path.join(
  process.cwd(),
  "scripts",
  "video-optimization-progress.json"
);

/*
 * Final summary report.
 */
const REPORT_JSON = path.join(
  process.cwd(),
  "scripts",
  "video-optimization-report.json"
);

const REPORT_CSV = path.join(
  process.cwd(),
  "scripts",
  "video-optimization-report.csv"
);

/*
 * Verified FFmpeg installation.
 */
const FFMPEG_BIN =
  "C:\\ffmpeg\\ffmpeg-9.0.1-essentials_build\\bin";

const FFMPEG_PATH = path.join(
  FFMPEG_BIN,
  "ffmpeg.exe"
);

const FFPROBE_PATH = path.join(
  FFMPEG_BIN,
  "ffprobe.exe"
);

/*
 * Supported video extensions.
 */
const VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".m4v",
  ".webm",
  ".ogg",
  ".ogv",
]);

/*
 * Containers that can safely receive H.264/AAC
 * using this script.
 *
 * Current inventory contains MP4 and MOV.
 */
const SUPPORTED_OUTPUT_EXTENSIONS =
  new Set([
    ".mp4",
    ".mov",
    ".m4v",
  ]);

/* ==========================================================================
   ENVIRONMENT
   ========================================================================== */

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    "Missing SUPABASE_URL or VITE_SUPABASE_URL in .env"
  );
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY in .env"
  );
}

/* ==========================================================================
   SUPABASE
   ========================================================================== */

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/* ==========================================================================
   GENERAL HELPERS
   ========================================================================== */

function isVideoFile(filePath) {
  return VIDEO_EXTENSIONS.has(
    path.extname(filePath).toLowerCase()
  );
}

function isSupportedOutputFile(filePath) {
  return SUPPORTED_OUTPUT_EXTENSIONS.has(
    path.extname(filePath).toLowerCase()
  );
}

function formatBytes(bytes) {
  if (
    !Number.isFinite(bytes) ||
    bytes < 0
  ) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  let value = bytes;
  let unitIndex = 0;

  while (
    value >= 1024 &&
    unitIndex < units.length - 1
  ) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

function csvEscape(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replaceAll(
      '"',
      '""'
    )}"`;
  }

  return stringValue;
}

function getContentType(filePath) {
  const extension =
    path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".mp4":
      return "video/mp4";

    case ".mov":
      return "video/quicktime";

    case ".m4v":
      return "video/x-m4v";

    default:
      return "application/octet-stream";
  }
}

function getSafeTempName(
  storagePath,
  suffix
) {
  return (
    storagePath
      .replaceAll("/", "__")
      .replaceAll("\\", "__") +
    suffix
  );
}

function calculateReduction(
  originalBytes,
  optimizedBytes
) {
  if (
    !originalBytes ||
    !Number.isFinite(originalBytes) ||
    !Number.isFinite(optimizedBytes)
  ) {
    return 0;
  }

  return Number(
    (
      (
        1 -
        optimizedBytes /
          originalBytes
      ) *
      100
    ).toFixed(2)
  );
}

/* ==========================================================================
   FFMPEG VERIFICATION
   ========================================================================== */

async function verifyFFmpeg() {
  console.log(
    "Checking FFmpeg..."
  );

  try {
    await execFileAsync(
      FFMPEG_PATH,
      ["-version"],
      {
        windowsHide: true,
        maxBuffer:
          10 * 1024 * 1024,
      }
    );

    await execFileAsync(
      FFPROBE_PATH,
      ["-version"],
      {
        windowsHide: true,
        maxBuffer:
          10 * 1024 * 1024,
      }
    );
  } catch (error) {
    throw new Error(
      [
        "FFmpeg / FFprobe could not be executed.",
        "",
        `FFmpeg: ${FFMPEG_PATH}`,
        `FFprobe: ${FFPROBE_PATH}`,
        "",
        error instanceof Error
          ? error.message
          : String(error),
      ].join("\n")
    );
  }

  console.log(
    "FFmpeg and FFprobe verified."
  );

  console.log("");
}

/* ==========================================================================
   STORAGE LISTING
   ========================================================================== */

async function listAllFiles(
  prefix = ""
) {
  const results = [];

  let offset = 0;

  const limit = 100;

  while (true) {
    const {
      data,
      error,
    } =
      await supabase.storage
        .from(BUCKET)
        .list(
          prefix,
          {
            limit,
            offset,
            sortBy: {
              column: "name",
              order: "asc",
            },
          }
        );

    if (error) {
      throw new Error(
        `Failed to list "${BUCKET}/${prefix}": ${error.message}`
      );
    }

    if (
      !data ||
      data.length === 0
    ) {
      break;
    }

    for (
      const item of data
    ) {
      const itemPath =
        prefix
          ? `${prefix}/${item.name}`
          : item.name;

      const isFolder =
        !item.metadata ||
        typeof item.metadata.size ===
          "undefined";

      if (isFolder) {
        const nestedFiles =
          await listAllFiles(
            itemPath
          );

        results.push(
          ...nestedFiles
        );
      } else {
        results.push({
          path: itemPath,

          filename:
            item.name,

          extension:
            path
              .extname(itemPath)
              .toLowerCase(),

          sizeBytes:
            Number(
              item.metadata.size
            ) || 0,

          mimetype:
            item.metadata
              .mimetype ||
            null,

          createdAt:
            item.created_at ||
            null,

          updatedAt:
            item.updated_at ||
            null,
        });
      }
    }

    if (
      data.length <
      limit
    ) {
      break;
    }

    offset += limit;
  }

  return results;
}

/* ==========================================================================
   FFPROBE
   ========================================================================== */

async function probeVideo(
  localPath
) {
  const {
    stdout,
  } =
    await execFileAsync(
      FFPROBE_PATH,
      [
        "-v",
        "error",

        "-show_entries",
        "format=format_name,duration,size,bit_rate",

        "-show_entries",
        "stream=index,codec_type,codec_name,profile,width,height,r_frame_rate,avg_frame_rate,bit_rate,sample_rate,channels,pix_fmt",

        "-of",
        "json",

        localPath,
      ],
      {
        windowsHide: true,
        maxBuffer:
          20 * 1024 * 1024,
      }
    );

  return JSON.parse(
    stdout
  );
}

/* ==========================================================================
   DOWNLOAD
   ========================================================================== */

async function downloadVideo(
  storagePath
) {
  await fs.mkdir(
    TEMP_DIR,
    {
      recursive: true,
    }
  );

  const localPath =
    path.join(
      TEMP_DIR,
      getSafeTempName(
        storagePath,
        "-original"
      )
    );

  console.log(
    "  Downloading..."
  );

  const {
    data,
    error,
  } =
    await supabase.storage
      .from(BUCKET)
      .download(
        storagePath
      );

  if (error) {
    throw new Error(
      `Download failed: ${error.message}`
    );
  }

  const arrayBuffer =
    await data.arrayBuffer();

  await fs.writeFile(
    localPath,
    Buffer.from(
      arrayBuffer
    )
  );

  return localPath;
}

/* ==========================================================================
   ADAPTIVE BITRATE CALCULATION
   ========================================================================== */

function calculateTargetBitrate({
  originalSizeBytes,
  durationSeconds,
  hasAudio,
  width,
  height,
}) {
  if (
    !Number.isFinite(
      originalSizeBytes
    ) ||
    !Number.isFinite(
      durationSeconds
    ) ||
    durationSeconds <= 0
  ) {
    throw new Error(
      "Cannot calculate target bitrate because duration or size is invalid."
    );
  }

  const targetBytes =
    originalSizeBytes *
    TARGET_SIZE_RATIO;

  const targetTotalBits =
    targetBytes * 8;

  const targetTotalKbps =
    targetTotalBits /
    durationSeconds /
    1000;

  const audioKbps =
    hasAudio
      ? AUDIO_BITRATE_KBPS
      : 0;

  let videoKbps =
    targetTotalKbps -
    audioKbps;

  /*
   * Resolution-aware minimum.
   *
   * These are conservative floors to avoid
   * destroying ordinary family-memory videos.
   */
  let resolutionMinimum =
    MIN_VIDEO_BITRATE_KBPS;

  if (
    width &&
    height
  ) {
    const pixels =
      width * height;

    if (
      pixels >=
      3840 * 2160
    ) {
      resolutionMinimum = 3500;
    } else if (
      pixels >=
      1920 * 1080
    ) {
      resolutionMinimum = 1400;
    } else if (
      pixels >=
      1280 * 720
    ) {
      resolutionMinimum = 800;
    } else {
      resolutionMinimum = 400;
    }
  }

  /*
   * Do not force the minimum if that would
   * mathematically make the output larger than
   * the original.
   *
   * Instead, use the calculated bitrate and
   * let the post-encode size check decide.
   */
  if (
    videoKbps <
    resolutionMinimum
  ) {
    videoKbps =
      Math.max(
        videoKbps,
        MIN_VIDEO_BITRATE_KBPS
      );
  }

  videoKbps =
    Math.min(
      videoKbps,
      MAX_VIDEO_BITRATE_KBPS
    );

  return {
    targetBytes,

    targetTotalKbps:
      Math.round(
        targetTotalKbps
      ),

    videoKbps:
      Math.max(
        200,
        Math.round(
          videoKbps
        )
      ),

    audioKbps,
  };
}

/* ==========================================================================
   ENCODE
   ========================================================================== */

async function optimizeVideo({
  inputPath,
  outputPath,
  videoKbps,
  hasAudio,
  fps,
}) {
  const args = [
    "-hide_banner",

    "-y",

    "-i",
    inputPath,

    /*
     * Video.
     */
    "-map",
    "0:v:0",

    "-c:v",
    "h264_qsv",

    /*
     * Adaptive bitrate.
     */
    "-b:v",
    `${videoKbps}k`,

    "-maxrate",
    `${videoKbps}k`,

    "-bufsize",
    `${Math.max(
      videoKbps * 2,
      400
    )}k`,

    /*
     * Pixel format supported by QSV.
     */
    "-vf",
    "format=nv12",

    /*
     * Preserve source frame rate.
     */
    ...(fps
      ? [
          "-r",
          String(fps),
        ]
      : []),

    /*
     * Audio is optional.
     */
    ...(hasAudio
      ? [
          "-map",
          "0:a:0?",
          "-c:a",
          "aac",
          "-b:a",
          `${AUDIO_BITRATE_KBPS}k`,
          "-ac",
          "2",
        ]
      : []),

    /*
     * Preserve metadata.
     */
    "-map_metadata",
    "0",

    /*
     * Progressive playback.
     */
    "-movflags",
    "+faststart",

    outputPath,
  ];

  console.log(
    `  Encoding at approximately ${videoKbps} kbps video...`
  );

  await execFileAsync(
    FFMPEG_PATH,
    args,
    {
      windowsHide: true,
      maxBuffer:
        20 * 1024 * 1024,
    }
  );
}

/* ==========================================================================
   VALIDATE OPTIMIZED FILE
   ========================================================================== */

async function validateOptimizedVideo({
  optimizedPath,
  original,
}) {
  const probe =
    await probeVideo(
      optimizedPath
    );

  const streams =
    Array.isArray(
      probe.streams
    )
      ? probe.streams
      : [];

  const videoStream =
    streams.find(
      (stream) =>
        stream.codec_type ===
        "video"
    );

  if (!videoStream) {
    throw new Error(
      "Optimized file contains no video stream."
    );
  }

  const duration =
    Number(
      probe.format?.duration
    );

  if (
    !Number.isFinite(
      duration
    ) ||
    duration <= 0
  ) {
    throw new Error(
      "Optimized file has invalid duration."
    );
  }

  const width =
    Number(
      videoStream.width
    );

  const height =
    Number(
      videoStream.height
    );

  if (
    !Number.isFinite(
      width
    ) ||
    !Number.isFinite(
      height
    ) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new Error(
      "Optimized file has invalid dimensions."
    );
  }

  /*
   * Resolution validation.
   *
   * IMPORTANT:
   *
   * Some source videos are portrait videos stored
   * with landscape pixel dimensions plus rotation
   * metadata.
   *
   * FFmpeg/QSV can normalize those dimensions:
   *
   *   848x480 -> 480x848
   *   1024x576 -> 576x1024
   *
   * These are orientation-equivalent.
   *
   * We therefore accept:
   *
   *   1. Exact width/height match
   *
   *   OR
   *
   *   2. Width/height swapped
   *
   * We do NOT accept arbitrary resolution changes.
   */

  if (
    original.width &&
    original.height
  ) {
    const exactMatch =
      width === original.width &&
      height === original.height;

    const swappedMatch =
      width === original.height &&
      height === original.width;

    if (
      !exactMatch &&
      !swappedMatch
    ) {
      throw new Error(
        [
          "Resolution changed unexpectedly.",
          `Original: ${original.width}x${original.height}`,
          `Optimized: ${width}x${height}`,
          "Only exact or orientation-swapped dimensions are accepted.",
        ].join("\n")
      );
    }

    if (swappedMatch) {
      console.log(
        "  Verified: dimensions rotated 90° equivalent; visual resolution preserved."
      );
    }
  }

  /*
   * Duration must remain very close.
   */
  const originalDuration =
    original.duration;

  const durationDifference =
    Math.abs(
      duration -
        originalDuration
    );

  const durationTolerance =
    Math.max(
      1,
      originalDuration *
        0.02
    );

  if (
    durationDifference >
    durationTolerance
  ) {
    throw new Error(
      [
        "Duration changed unexpectedly.",
        `Original: ${originalDuration}s`,
        `Optimized: ${duration}s`,
      ].join("\n")
    );
  }

  return {
    duration,

    width,

    height,

    codec:
      videoStream.codec_name ||
      null,

    fps:
      videoStream.avg_frame_rate ||
      videoStream.r_frame_rate ||
      null,
  };
}

/* ==========================================================================
   REMOTE REPLACEMENT
   ========================================================================== */

async function replaceRemoteVideo({
  storagePath,
  localOptimizedPath,
}) {
  const contentType =
    getContentType(
      storagePath
    );

  const fileBuffer =
    await fs.readFile(
      localOptimizedPath
    );

  console.log(
    "  Uploading optimized video..."
  );

  const {
    error: uploadError,
  } =
    await supabase.storage
      .from(BUCKET)
      .upload(
        storagePath,
        fileBuffer,
        {
          contentType,
          upsert: true,
          cacheControl:
            "31536000",
        }
      );

  if (uploadError) {
    throw new Error(
      `Upload failed: ${uploadError.message}`
    );
  }

  /*
   * Verify remote object.
   */
  const directory =
    path.posix.dirname(
      storagePath
    );

  const filename =
    path.posix.basename(
      storagePath
    );

  const {
    data,
    error: listError,
  } =
    await supabase.storage
      .from(BUCKET)
      .list(
        directory === "."
          ? ""
          : directory,
        {
          limit: 100,
          offset: 0,
          search: filename,
        }
      );

  if (listError) {
    throw new Error(
      `Remote verification failed: ${listError.message}`
    );
  }

  const remoteFile =
    (data || []).find(
      (item) =>
        item.name ===
        filename
    );

  if (!remoteFile) {
    throw new Error(
      "Remote optimized video could not be verified."
    );
  }

  const remoteSize =
    Number(
      remoteFile.metadata?.size
    );

  if (
    !Number.isFinite(
      remoteSize
    ) ||
    remoteSize !==
      fileBuffer.length
  ) {
    throw new Error(
      [
        "Remote size verification failed.",
        `Local optimized: ${fileBuffer.length}`,
        `Remote: ${remoteSize}`,
      ].join("\n")
    );
  }

  console.log(
    "  Remote upload verified."
  );
}

/* ==========================================================================
   PROGRESS FILE
   ========================================================================== */

async function loadProgress() {
  try {
    const text =
      await fs.readFile(
        PROGRESS_FILE,
        "utf8"
      );

    return JSON.parse(
      text
    );
  } catch {
    return {
      version: 1,

      startedAt:
        new Date().toISOString(),

      completed: {},
    };
  }
}

async function saveProgress(
  progress
) {
  await fs.writeFile(
    PROGRESS_FILE,
    JSON.stringify(
      progress,
      null,
      2
    ),
    "utf8"
  );
}

/* ==========================================================================
   PROCESS ONE VIDEO
   ========================================================================== */

async function processVideo({
  video,
  index,
  total,
}) {
  const storagePath =
    video.path;

  const originalSize =
    video.sizeBytes;

  console.log("");

  console.log(
    "----------------------------------------"
  );

  console.log(
    `[${index}/${total}] ${storagePath}`
  );

  console.log(
    `  Original: ${formatBytes(
      originalSize
    )}`
  );

  let originalLocalPath =
    null;

  let optimizedLocalPath =
    null;

  try {
    /*
     * Containers outside MP4/MOV/M4V are not
     * currently suitable for H.264/AAC replacement
     * while preserving the existing extension.
     */
    if (
      !isSupportedOutputFile(
        storagePath
      )
    ) {
      console.log(
        "  SKIPPED: unsupported container for this optimizer."
      );

      return {
        path:
          storagePath,

        originalSize,

        optimizedSize:
          null,

        reduction:
          null,

        status:
          "skipped-unsupported-container",

        error:
          null,
      };
    }

    /*
     * Download.
     */
    originalLocalPath =
      await downloadVideo(
        storagePath
      );

    /*
     * Probe original.
     */
    console.log(
      "  Reading original metadata..."
    );

    const originalProbe =
      await probeVideo(
        originalLocalPath
      );

    const streams =
      Array.isArray(
        originalProbe.streams
      )
        ? originalProbe.streams
        : [];

    const videoStream =
      streams.find(
        (stream) =>
          stream.codec_type ===
          "video"
      );

    const audioStream =
      streams.find(
        (stream) =>
          stream.codec_type ===
          "audio"
      );

    if (!videoStream) {
      throw new Error(
        "Original file contains no video stream."
      );
    }

    const duration =
      Number(
        originalProbe.format
          ?.duration
      );

    if (
      !Number.isFinite(
        duration
      ) ||
      duration <= 0
    ) {
      throw new Error(
        "Original duration is invalid."
      );
    }

    const width =
      Number(
        videoStream.width
      );

    const height =
      Number(
        videoStream.height
      );

    const fpsText =
      videoStream.avg_frame_rate ||
      videoStream.r_frame_rate ||
      null;

    let fps = null;

    if (
      fpsText &&
      typeof fpsText ===
        "string"
    ) {
      const parts =
        fpsText.split(
          "/"
        );

      if (
        parts.length ===
        2
      ) {
        const numerator =
          Number(
            parts[0]
          );

        const denominator =
          Number(
            parts[1]
          );

        if (
          Number.isFinite(
            numerator
          ) &&
          Number.isFinite(
            denominator
          ) &&
          denominator !==
            0
        ) {
          fps =
            Number(
              (
                numerator /
                denominator
              ).toFixed(3)
            );
        }
      }
    }

    const hasAudio =
      Boolean(
        audioStream
      );

    /*
     * Calculate adaptive target.
     */
    const bitrate =
      calculateTargetBitrate(
        {
          originalSizeBytes:
            originalSize,

          durationSeconds:
            duration,

          hasAudio,

          width,

          height,
        }
      );

    console.log(
      `  Source: ${width}x${height} | ${fps ?? "?"} fps | ${videoStream.codec_name ?? "?"}`
    );

    console.log(
      `  Target: ~${formatBytes(
        bitrate.targetBytes
      )}`
    );

    console.log(
      `  Video bitrate: ${bitrate.videoKbps} kbps`
    );

    if (hasAudio) {
      console.log(
        `  Audio bitrate: ${AUDIO_BITRATE_KBPS} kbps`
      );
    } else {
      console.log(
        "  Audio: none"
      );
    }

    /*
     * Prepare output.
     */
    const extension =
      path.extname(
        storagePath
      ).toLowerCase();

    optimizedLocalPath =
      path.join(
        TEMP_DIR,
        getSafeTempName(
          storagePath,
          "-optimized" +
            extension
        )
      );

    /*
     * Encode.
     */
    await optimizeVideo(
      {
        inputPath:
          originalLocalPath,

        outputPath:
          optimizedLocalPath,

        videoKbps:
          bitrate.videoKbps,

        hasAudio,

        fps,
      }
    );

    /*
     * Check physical output.
     */
    const optimizedStat =
      await fs.stat(
        optimizedLocalPath
      );

    const optimizedSize =
      optimizedStat.size;

    if (
      !Number.isFinite(
        optimizedSize
      ) ||
      optimizedSize <= 0
    ) {
      throw new Error(
        "Optimized file is empty."
      );
    }

    const reduction =
      calculateReduction(
        originalSize,
        optimizedSize
      );

    console.log(
      `  Result: ${formatBytes(
        optimizedSize
      )}`
    );

    console.log(
      `  Reduction: ${reduction}%`
    );

    /*
     * Never replace with a larger or equal file.
     */
    if (
      optimizedSize >=
      originalSize
    ) {
      console.log(
        "  SKIPPED: optimized file is not smaller."
      );

      return {
        path:
          storagePath,

        originalSize,

        optimizedSize,

        reduction,

        status:
          "skipped-not-smaller",

        error:
          null,
      };
    }

    /*
     * Validate optimized file.
     */
    console.log(
      "  Validating optimized video..."
    );

    const validation =
      await validateOptimizedVideo(
        {
          optimizedPath:
            optimizedLocalPath,

          original: {
            duration,

            width,

            height,
          },
        }
      );

    console.log(
      `  Verified: ${validation.width}x${validation.height} | ${validation.codec}`
    );

    /*
     * Replace remote object.
     */
    await replaceRemoteVideo(
      {
        storagePath,

        localOptimizedPath:
          optimizedLocalPath,
      }
    );

    console.log(
      "  REPLACED SUCCESSFULLY."
    );

    console.log(
      `  Storage saved: ${formatBytes(
        originalSize -
          optimizedSize
      )}`
    );

    return {
      path:
        storagePath,

      originalSize,

      optimizedSize,

      reduction,

      status:
        "optimized",

      error:
        null,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `  FAILED: ${message}`
    );

    /*
     * Original remains untouched unless the
     * remote upload was successfully completed.
     */
    return {
      path:
        storagePath,

      originalSize,

      optimizedSize:
        null,

      reduction:
        null,

      status:
        "failed",

      error:
        message,
    };
  } finally {
    /*
     * Always clean local temporary files.
     */
    if (
      originalLocalPath
    ) {
      try {
        await fs.unlink(
          originalLocalPath
        );
      } catch {
        // Ignore cleanup errors.
      }
    }

    if (
      optimizedLocalPath
    ) {
      try {
        await fs.unlink(
          optimizedLocalPath
        );
      } catch {
        // Ignore cleanup errors.
      }
    }
  }
}

/* ==========================================================================
   MAIN
   ========================================================================== */

async function main() {
  console.log("");

  console.log(
    "========================================"
  );

  console.log(
    " AZAIN ADAPTIVE VIDEO OPTIMIZER"
  );

  console.log(
    " RESUME / RETRY MODE"
  );

  console.log(
    "========================================"
  );

  console.log("");

  console.log(
    `Bucket: ${BUCKET}`
  );

  console.log(
    "Target size: approximately 40% of original"
  );

  console.log(
    "Target reduction: approximately 60%"
  );

  console.log(
    "Encoder: Intel Quick Sync H.264"
  );

  console.log(
    `Audio: AAC ${AUDIO_BITRATE_KBPS}k`
  );

  console.log("");

  await verifyFFmpeg();

  await fs.mkdir(
    TEMP_DIR,
    {
      recursive: true,
    }
  );

  /*
   * Load existing resume state.
   *
   * IMPORTANT:
   * Successful files remain recorded here.
   * Failed files are NOT recorded as completed.
   */
  const progress =
    await loadProgress();

  console.log(
    "Reading Storage inventory..."
  );

  const allFiles =
    await listAllFiles();

  const videos =
    allFiles
      .filter(
        (file) =>
          isVideoFile(
            file.path
          )
      )
      .sort(
        (a, b) =>
          b.sizeBytes -
          a.sizeBytes
      );

  console.log("");

  console.log(
    `All files: ${allFiles.length}`
  );

  console.log(
    `Videos found: ${videos.length}`
  );

  console.log("");

  if (
    videos.length === 0
  ) {
    console.log(
      "No videos found."
    );

    return;
  }

  /*
   * Show resume information.
   */
  const completedCount =
    Object.keys(
      progress.completed || {}
    ).length;

  if (
    completedCount > 0
  ) {
    console.log(
      `Previously processed successfully/skipped: ${completedCount}`
    );

    console.log(
      "Resume mode is active — failed files will be retried."
    );

    console.log("");
  }

  const results = [];

  for (
    let index = 0;
    index < videos.length;
    index++
  ) {
    const video =
      videos[index];

    const pathKey =
      video.path;

    /*
     * Skip paths already recorded as successfully
     * optimized or intentionally skipped.
     *
     * Failed files are retried on the next run.
     */
    const previous =
      progress.completed?.[
        pathKey
      ];

    if (
      previous &&
      (
        previous.status ===
          "optimized" ||
        previous.status ===
          "skipped-not-smaller" ||
        previous.status ===
          "skipped-unsupported-container"
      )
    ) {
      console.log(
        `[${index + 1}/${videos.length}] ${video.path}`
      );

      console.log(
        `  RESUME: already processed as ${previous.status}`
      );

      results.push(
        previous
      );

      continue;
    }

    const result =
      await processVideo(
        {
          video,

          index:
            index + 1,

          total:
            videos.length,
        }
      );

    results.push(
      result
    );

    /*
     * Persist progress immediately after each
     * video so an interruption does not lose
     * the completed work.
     *
     * Failed files intentionally remain absent
     * from completed so they can be retried.
     */
    if (
      result.status !==
      "failed"
    ) {
      progress.completed[
        pathKey
      ] = result;
    }

    await saveProgress(
      progress
    );
  }

  /* ------------------------------------------------------------------------
     Summary
     ------------------------------------------------------------------------ */

  const optimized =
    results.filter(
      (result) =>
        result.status ===
        "optimized"
    );

  const skipped =
    results.filter(
      (result) =>
        result.status ===
          "skipped-not-smaller" ||
        result.status ===
          "skipped-unsupported-container"
    );

  const failed =
    results.filter(
      (result) =>
        result.status ===
        "failed"
    );

  /*
   * Calculate storage using the current result
   * set.
   *
   * For skipped/failed videos, original size
   * remains in Storage.
   */
  const originalTotal =
    results.reduce(
      (sum, result) =>
        sum +
        (
          Number(
            result.originalSize
          ) || 0
        ),
      0
    );

  const finalTotal =
    results.reduce(
      (sum, result) => {
        if (
          result.status ===
          "optimized"
        ) {
          return (
            sum +
            (
              Number(
                result.optimizedSize
              ) || 0
            )
          );
        }

        return (
          sum +
          (
            Number(
              result.originalSize
            ) || 0
          )
        );
      },
      0
    );

  const savedBytes =
    originalTotal -
    finalTotal;

  const overallReduction =
    calculateReduction(
      originalTotal,
      finalTotal
    );

  const report = {
    generatedAt:
      new Date().toISOString(),

    bucket:
      BUCKET,

    targetSizeRatio:
      TARGET_SIZE_RATIO,

    targetReductionPercent:
      60,

    encoder:
      "h264_qsv",

    audioBitrateKbps:
      AUDIO_BITRATE_KBPS,

    totalVideos:
      videos.length,

    optimizedCount:
      optimized.length,

    skippedCount:
      skipped.length,

    failedCount:
      failed.length,

    originalTotalBytes:
      originalTotal,

    originalTotalMB:
      Number(
        (
          originalTotal /
          (1024 * 1024)
        ).toFixed(2)
      ),

    finalTotalBytes:
      finalTotal,

    finalTotalMB:
      Number(
        (
          finalTotal /
          (1024 * 1024)
        ).toFixed(2)
      ),

    savedBytes,

    savedMB:
      Number(
        (
          savedBytes /
          (1024 * 1024)
        ).toFixed(2)
      ),

    overallReduction,

    results,
  };

  await fs.writeFile(
    REPORT_JSON,
    JSON.stringify(
      report,
      null,
      2
    ),
    "utf8"
  );

  const headers = [
    "path",
    "original_size_bytes",
    "optimized_size_bytes",
    "reduction_percent",
    "status",
    "error",
  ];

  const csvLines = [
    headers.join(","),
  ];

  for (
    const result of results
  ) {
    csvLines.push(
      [
        result.path,
        result.originalSize,
        result.optimizedSize ??
          "",
        result.reduction ??
          "",
        result.status,
        result.error ??
          "",
      ]
        .map(
          csvEscape
        )
        .join(",")
    );
  }

  await fs.writeFile(
    REPORT_CSV,
    csvLines.join("\n"),
    "utf8"
  );

  await fs.rm(
    TEMP_DIR,
    {
      recursive: true,
      force: true,
    }
  );

  console.log("");

  console.log(
    "========================================"
  );

  console.log(
    " VIDEO OPTIMIZATION COMPLETE"
  );

  console.log(
    "========================================"
  );

  console.log("");

  console.log(
    `Videos found: ${videos.length}`
  );

  console.log(
    `Optimized: ${optimized.length}`
  );

  console.log(
    `Skipped: ${skipped.length}`
  );

  console.log(
    `Failed: ${failed.length}`
  );

  console.log("");

  console.log(
    `Original total: ${formatBytes(
      originalTotal
    )}`
  );

  console.log(
    `Final total: ${formatBytes(
      finalTotal
    )}`
  );

  console.log(
    `Storage saved: ${formatBytes(
      savedBytes
    )}`
  );

  console.log(
    `Overall reduction: ${overallReduction}%`
  );

  console.log("");

  console.log(
    `Progress: ${PROGRESS_FILE}`
  );

  console.log(
    `Report: ${REPORT_JSON}`
  );

  console.log(
    `CSV: ${REPORT_CSV}`
  );

  console.log("");

  console.log(
    "Database records were not modified."
  );

  console.log(
    "Application code was not modified."
  );

  console.log("");
}

/* ==========================================================================
   START
   ========================================================================== */

main().catch(
  (error) => {
    console.error("");

    console.error(
      "VIDEO OPTIMIZATION FAILED"
    );

    console.error("");

    console.error(
      error instanceof Error
        ? error.message
        : String(error)
    );

    console.error("");

    process.exit(1);
  }
);