package com.example

/**
 * Clip mute / original-audio helpers used when overlay music is added.
 * VFX Pro global video track muting and batch volume operations.
 */

fun PlaybackViewModel.muteOriginalVideoAudio() {
  muteAllVideoClips()
}

fun PlaybackViewModel.unmuteOriginalVideoAudio() {
  unmuteAllVideoClips()
}

fun PlaybackViewModel.applyClipVolume(clipId: String, newVolume: Float) {
  setClipVolume(clipId, newVolume)
}
