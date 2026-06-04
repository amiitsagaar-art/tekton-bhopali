import sys

with open('src/components/TektonApp.tsx', 'r', encoding='utf8') as f:
    content = f.read()

idx = content.find('appointments.filter(')
if idx == -1:
    idx = content.find('appointments.map(')

if idx != -1:
    print(content[max(0, idx - 100):idx + 1000])
else:
    print("Could not find appointments rendering logic.")
