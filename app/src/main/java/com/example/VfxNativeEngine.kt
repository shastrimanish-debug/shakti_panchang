package com.example

/**
 * JNI Bridge for the C++ VFX Native Engine.
 * Architectural setup for high-performance frame rendering and pixel pipeline.
 */
object VfxNativeEngine {
  init {
    try {
      System.loadLibrary("vfx_engine")
    } catch (e: UnsatisfiedLinkError) {
      // Fallback for JVM unit tests and environments without NDK binaries
    }
  }

  /**
   * Native C++ rendering function executed on the hardware graphics pipeline.
   */
  external fun renderFrame(): String
}
