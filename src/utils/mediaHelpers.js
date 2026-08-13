/*
|--------------------------------------------------------------------------
| MEDIA HELPERS
|--------------------------------------------------------------------------
|
| Media files are uploaded from the Admin panel. The returned storage URL
| is only used internally by the app; Admin users never need to enter URLs.
|
*/

export function isVideoMedia(source) {
  if (!source) return false;

  const value = String(source).toLowerCase().split("?")[0];

  return /\.(mp4|webm|mov|m4v|ogg|ogv)$/i.test(value);
}

export function isImageMedia(source) {
  return !isVideoMedia(source);
}
