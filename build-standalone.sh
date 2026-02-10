#!/bin/bash

# Build standalone HTML file
OUTPUT="/home/user/-/startup-hr-pro-standalone.html"
SRCDIR="/home/user/-/startup-hr-pro"

# Start HTML
cat > "$OUTPUT" << 'HTMLSTART'
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="스타트업 대표를 위한 프로페셔널 HR/법무 관리 플랫폼">
  <title>StartupHR Pro - Professional Edition (Standalone)</title>

  <!-- External CDN Libraries (Required) -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

  <!-- Favicon -->
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>">

  <!-- Inline CSS -->
  <style>
HTMLSTART

# Add CSS
cat "$SRCDIR/css/custom.css" >> "$OUTPUT"

# Close style and start body
cat >> "$OUTPUT" << 'HTMLMID'
  </style>
</head>
<body class="bg-gray-100 animated-bg">
HTMLMID

# Add HTML body from index.html (extract body content only)
sed -n '/<body/,/<\/body>/p' "$SRCDIR/index.html" | sed '1d;$d' >> "$OUTPUT"

# Add inline JavaScript
echo "  <!-- Combined JavaScript (All Modules Inlined) -->" >> "$OUTPUT"
echo "  <script>" >> "$OUTPUT"

# Add all JS files in correct order
cat "$SRCDIR/js/data-manager.js" >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat "$SRCDIR/js/utils.js" >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat "$SRCDIR/js/settings.js" >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat "$SRCDIR/js/employees.js" >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat "$SRCDIR/js/contracts.js" >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat "$SRCDIR/js/attendance.js" >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat "$SRCDIR/js/legal-check.js" >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat "$SRCDIR/js/checklist.js" >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat "$SRCDIR/js/conversations.js" >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat "$SRCDIR/js/dashboard-widgets.js" >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat "$SRCDIR/js/email-templates.js" >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat "$SRCDIR/js/app.js" >> "$OUTPUT"

# Close the combined JavaScript
echo "  </script>" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Close HTML
echo "</body>" >> "$OUTPUT"
echo "</html>" >> "$OUTPUT"

echo "Standalone HTML created at: $OUTPUT"
wc -l "$OUTPUT"
