#!/usr/bin/env python3
# StartupHR Pro Windows Installer

import os
import base64

print("🚀 StartupHR Pro 설치 시작...")
print("📁 파일 생성 중...")

# Read the standalone HTML file
with open('startup-hr-pro-standalone.html', 'rb') as f:
    html_content = f.read()

# Write to Desktop
desktop_path = os.path.expanduser('~/Desktop/StartupHR-Pro.html')
with open(desktop_path, 'wb') as f:
    f.write(html_content)

print(f"✅ 완료! 파일 위치: {desktop_path}")
print("🎉 바탕화면에서 StartupHR-Pro.html 더블클릭하세요!")
