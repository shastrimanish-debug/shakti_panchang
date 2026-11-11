with open('/app/applet/android/app/build.gradle', 'r') as f:
    gradle = f.read()

print("Checking build.gradle signing config")
