/**
 * ============================================================================
 * AZAIN — RETRY FAILED VIDEOS ONLY
 * ============================================================================
 *
 * IMPORTANT:
 *   THIS SCRIPT DOES NOT SCAN / PROCESS ALL 197 VIDEOS.
 *
 *   It reads:
 *
 *     scripts/video-optimization-report.json
 *
 *   and extracts ONLY entries where:
 *
 *     status === "failed"
 *
 *   From the previous optimization run.
 *
 * CURRENT PURPOSE:
 *   Retry the 28 videos that failed because FFmpeg normalized
 *   portrait dimensions, for example:
 *
 *      848x480 -> 480x848
 *      1024x576 -> 576x1024
 *
 *   These are now accepted as orientation-equivalent.
 *
 * SAFETY:
 *   - Only failed entries from the existing report are processed.
 *   - Already optimized 169 videos are never touched.
 *   - Database is never modified.
 *   - Storage paths are preserved.
 *   - Original is only replaced after successful validation.
 *   - Optimized file must be smaller than original.
 *   - Remote upload is verified.
 *   - One video at a time.
 * ============================================================================
 */

import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { createClient } from "@supabase/supabase-js";

const execFileAsync =
  promisify(execFile);

/* ==========================================================================
   CONFIGURATION
   ========================================================================== */

const BUCKET = "timeline";

const REPORT_JSON = path.join(
  process.cwd(),
  "scripts",
  "video-optimization-report.json"
);

const RETRY_REPORT_JSON = path.join(
  process.cwd(),
  "scripts",
  "video-retry-report.json"
);

const RETRY_REPORT_CSV = path.join(
  process.cwd(),
  "scripts",
  "video-retry-report.csv"
);

const TEMP_DIR = path.join(
  process.cwd(),
  "scripts",
  ".video-retry-tmp"
);

/*
 * Same target used by the original optimizer.
 *
 * Approximately 40% of original size
 * = approximately 60% reduction.
 */
const TARGET_SIZE_RATIO = 0.40;

/*
 * Audio bitrate.
 */
const AUDIO_BITRATE_KBPS = 96;

/*
 * Minimum video bitrate.
 */
const MIN_VIDEO_BITRATE_KBPS = 400;

/*
 * Maximum video bitrate.
 */
const MAX_VIDEO_BITRATE_KBPS = 12000;

/*
 * FFmpeg installation.
 */
const FFMPEG_BIN =
  "C:\\ffmpeg\\ffmpeg-9.0.1-essentials_build\\bin";

const FFMPEG_PATH =
  path.join(
    FFMPEG_BIN,
    "ffmpeg.exe"
  );

const FFPROBE_PATH =
  path.join(
    FFMPEG_BIN,
    "ffprobe.exe"
  );

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

const supabase =
  createClient(
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
   HELPERS
   ========================================================================== */

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
  let index = 0;

  while (
    value >= 1024 &&
    index < units.length - 1
  ) {
    value /= 1024;
    index++;
  }

  return `${value.toFixed(2)} ${units[index]}`;
}

function csvEscape(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  const stringValue =
    String(value);

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

function getContentType(
  storagePath
) {
  const extension =
    path.extname(
      storagePath
    ).toLowerCase();

  if (extension === ".mp4") {
    return "video/mp4";
  }

  if (extension === ".mov") {
    return "video/quicktime";
  }

  if (extension === ".m4v") {
    return "video/x-m4v";
  }

  return "application/octet-stream";
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
    !Number.isFinite(
      originalBytes
    ) ||
    !Number.isFinite(
      optimizedBytes
    )
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
   VERIFY FFMPEG
   ========================================================================== */

async function verifyFFmpeg() {
  console.log(
    "Checking FFmpeg..."
  );

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

  console.log(
    "FFmpeg and FFprobe verified."
  );

  console.log("");
}

/* ==========================================================================
   LOAD ONLY THE FAILED FILES FROM EXISTING REPORT
   ========================================================================== */

async function loadFailedVideos() {
  console.log(
    "Reading previous optimization report..."
  );

  let reportText;

  try {
    reportText =
      await fs.readFile(
        REPORT_JSON,
        "utf8"
      );
  } catch {
    throw new Error(
      [
        "Could not find:",
        REPORT_JSON,
        "",
        "The original optimization report is required.",
      ].join("\n")
    );
  }

  let report;

  try {
    report =
      JSON.parse(
        reportText
      );
  } catch {
    throw new Error(
      "video-optimization-report.json is not valid JSON."
    );
  }

  if (
    !Array.isArray(
      report.results
    )
  ) {
    throw new Error(
      "The previous report does not contain a valid results array."
    );
  }

  /*
   * THIS IS THE CRITICAL FILTER.
   *
   * Nothing else is selected.
   */
  const failedVideos =
    report.results.filter(
      (item) =>
        item &&
        item.status ===
          "failed" &&
        typeof item.path ===
          "string"
    );

  return {
    report,
    failedVideos,
  };
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
    "  Downloading original..."
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
   TARGET BITRATE
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
      "Invalid size or duration."
    );
  }

  const targetBytes =
    originalSizeBytes *
    TARGET_SIZE_RATIO;

  const targetTotalKbps =
    (
      targetBytes *
      8
    ) /
    durationSeconds /
    1000;

  const audioKbps =
    hasAudio
      ? AUDIO_BITRATE_KBPS
      : 0;

  let videoKbps =
    targetTotalKbps -
    audioKbps;

  let resolutionMinimum =
    MIN_VIDEO_BITRATE_KBPS;

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

    videoKbps:
      Math.max(
        200,
        Math.round(
          videoKbps
        )
      ),
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
     * Video stream.
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
     * QSV-compatible pixel format.
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
     * Audio.
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
   VALIDATION
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
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new Error(
      "Optimized file has invalid dimensions."
    );
  }

  /*
   * IMPORTANT FIX:
   *
   * Accept either:
   *
   *   Original 848x480
   *   Optimized 848x480
   *
   * OR:
   *
   *   Original 848x480
   *   Optimized 480x848
   *
   * The second case is an orientation-equivalent
   * portrait normalization.
   */

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
      "  Verified: orientation-swapped dimensions accepted."
    );
  }

  /*
   * Duration validation.
   */
  const durationDifference =
    Math.abs(
      duration -
        original.duration
    );

  const durationTolerance =
    Math.max(
      1,
      original.duration *
        0.02
    );

  if (
    durationDifference >
    durationTolerance
  ) {
    throw new Error(
      [
        "Duration changed unexpectedly.",
        `Original: ${original.duration}s`,
        `Optimized: ${duration}s`,
      ].join("\n")
    );
  }

  return {
    width,
    height,
    duration,

    codec:
      videoStream.codec_name ||
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
  const fileBuffer =
    await fs.readFile(
      localOptimizedPath
    );

  const contentType =
    getContentType(
      storagePath
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
    error,
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

  if (error) {
    throw new Error(
      `Remote verification failed: ${error.message}`
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
   PROCESS ONE FAILED VIDEO
   ========================================================================== */

async function processFailedVideo({
  video,
  index,
  total,
}) {
  const storagePath =
    video.path;

  let originalLocalPath =
    null;

  let optimizedLocalPath =
    null;

  try {
    console.log("");
    console.log(
      "----------------------------------------"
    );

    console.log(
      `[${index}/${total}] ${storagePath}`
    );

    console.log(
      `  Previous failure: ${video.error}`
    );

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
        originalProbe.format?.duration
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

    /*
     * Get CURRENT actual Storage size.
     *
     * We intentionally do not use the old report size
     * for replacement safety.
     */
    const originalStat =
      await fs.stat(
        originalLocalPath
      );

    const originalSize =
      originalStat.size;

    /*
     * FPS.
     */
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
          Number(parts[0]);

        const denominator =
          Number(parts[1]);

        if (
          Number.isFinite(
            numerator
          ) &&
          Number.isFinite(
            denominator
          ) &&
          denominator !== 0
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

    console.log(
      `  Source: ${width}x${height} | ${fps ?? "?"} fps | ${videoStream.codec_name ?? "?"}`
    );

    console.log(
      `  Current original: ${formatBytes(
        originalSize
      )}`
    );

    /*
     * Calculate bitrate.
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
      `  Target: ~${formatBytes(
        bitrate.targetBytes
      )}`
    );

    console.log(
      `  Video bitrate: ${bitrate.videoKbps} kbps`
    );

    console.log(
      `  Audio bitrate: ${
        hasAudio
          ? AUDIO_BITRATE_KBPS
          : 0
      } kbps`
    );

    /*
     * Output path.
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
          "-retry-optimized" +
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
     * Size.
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
     * NEVER replace with larger/equal file.
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
     * Validate.
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
            width,

            height,

            duration,
          },
        }
      );

    console.log(
      `  Verified: ${validation.width}x${validation.height} | ${validation.codec}`
    );

    /*
     * Replace only this failed Storage object.
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
      `  FAILED AGAIN: ${message}`
    );

    return {
      path:
        storagePath,

      originalSize:
        video.originalSize ??
        null,

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
    " AZAIN VIDEO RETRY"
  );

  console.log(
    " FAILED FILES ONLY"
  );

  console.log(
    "========================================"
  );

  console.log("");

  console.log(
    `Bucket: ${BUCKET}`
  );

  console.log(
    "Target: approximately 40% of original"
  );

  console.log(
    "Encoder: Intel Quick Sync H.264"
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
   * Read the PREVIOUS report.
   */
  const {
    report,
    failedVideos,
  } =
    await loadFailedVideos();

  console.log("");

  console.log(
    `Previous total videos: ${
      report.totalVideos ??
      "unknown"
    }`
  );

  console.log(
    `Previous optimized: ${
      report.optimizedCount ??
      "unknown"
    }`
  );

  console.log(
    `Previous failed: ${
      report.failedCount ??
      "unknown"
    }`
  );

  console.log("");

  /*
   * HARD SAFETY CHECK.
   *
   * This script was created specifically for the
   * 28 failures from your previous run.
   *
   * If the report contains a different number,
   * STOP instead of accidentally processing
   * something unexpected.
   */
  if (
    failedVideos.length !==
    28
  ) {
    throw new Error(
      [
        `SAFETY STOP: Expected exactly 28 failed videos, but the report contains ${failedVideos.length}.`,
        "",
        "No videos were processed.",
        "",
        "This prevents accidentally running the retry script against an unexpected report.",
      ].join("\n")
    );
  }

  console.log(
    "========================================"
  );

  console.log(
    " CONFIRMED"
  );

  console.log(
    " EXACTLY 28 FAILED VIDEOS"
  );

  console.log(
    " ONLY THESE WILL BE PROCESSED"
  );

  console.log(
    "========================================"
  );

  console.log("");

  const results = [];

  for (
    let index = 0;
    index < failedVideos.length;
    index++
  ) {
    const result =
      await processFailedVideo(
        {
          video:
            failedVideos[index],

          index:
            index + 1,

          total:
            failedVideos.length,
        }
      );

    results.push(
      result
    );
  }

  /*
   * Summary.
   */
  const optimized =
    results.filter(
      (item) =>
        item.status ===
        "optimized"
    );

  const skipped =
    results.filter(
      (item) =>
        item.status ===
        "skipped-not-smaller"
    );

  const failed =
    results.filter(
      (item) =>
        item.status ===
        "failed"
    );

  const originalTotal =
    results.reduce(
      (sum, item) =>
        sum +
        (
          Number(
            item.originalSize
          ) || 0
        ),
      0
    );

  const finalTotal =
    results.reduce(
      (sum, item) => {
        if (
          item.status ===
          "optimized"
        ) {
          return (
            sum +
            (
              Number(
                item.optimizedSize
              ) || 0
            )
          );
        }

        return (
          sum +
          (
            Number(
              item.originalSize
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

  const retryReport = {
    generatedAt:
      new Date().toISOString(),

    bucket:
      BUCKET,

    sourceReport:
      REPORT_JSON,

    purpose:
      "Retry exactly the 28 failed videos from the previous optimization run.",

    expectedFailedCount:
      28,

    processedCount:
      results.length,

    optimizedCount:
      optimized.length,

    skippedCount:
      skipped.length,

    failedCount:
      failed.length,

    originalTotalBytes:
      originalTotal,

    finalTotalBytes:
      finalTotal,

    savedBytes,

    overallReduction,

    results,
  };

  await fs.writeFile(
    RETRY_REPORT_JSON,
    JSON.stringify(
      retryReport,
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
    RETRY_REPORT_CSV,
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
    " 28-FILE RETRY COMPLETE"
  );

  console.log(
    "========================================"
  );

  console.log("");

  console.log(
    `Files processed: ${results.length}`
  );

  console.log(
    `Optimized successfully: ${optimized.length}`
  );

  console.log(
    `Skipped: ${skipped.length}`
  );

  console.log(
    `Failed again: ${failed.length}`
  );

  console.log("");

  console.log(
    `Original size of 28 files: ${formatBytes(
      originalTotal
    )}`
  );

  console.log(
    `Final size of 28 files: ${formatBytes(
      finalTotal
    )}`
  );

  console.log(
    `Additional storage saved: ${formatBytes(
      savedBytes
    )}`
  );

  console.log(
    `Retry reduction: ${overallReduction}%`
  );

  console.log("");

  console.log(
    `Retry report: ${RETRY_REPORT_JSON}`
  );

  console.log(
    `Retry CSV: ${RETRY_REPORT_CSV}`
  );

  console.log("");

  console.log(
    "The other 169 videos were NOT processed."
  );

  console.log(
    "Database records were NOT modified."
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
      "VIDEO RETRY FAILED"
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