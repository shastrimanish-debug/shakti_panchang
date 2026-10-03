#include <jni.h>
#include <string>

/**
 * Native C++ VFX Rendering Engine
 * JNI Implementation for VfxNativeEngine.renderFrame()
 */
extern "C" JNIEXPORT jstring JNICALL
Java_com_example_VfxNativeEngine_renderFrame(
    JNIEnv* env,
    jobject /* this */) {
    std::string result = "Native Frame Rendered";
    return env->NewStringUTF(result.c_str());
}
