import os
import cv2
import numpy as np

OUT = os.path.dirname(os.path.abspath(__file__))
img = np.full((800, 800, 3), 255, dtype=np.uint8)  # white background

def put(text, y, scale=1.6, color=(40, 40, 40), thickness=3):
    (w, h), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, scale, thickness)
    x = (800 - w) // 2
    cv2.putText(img, text, (x, y), cv2.FONT_HERSHEY_SIMPLEX, scale, color, thickness, cv2.LINE_AA)

put("BIg 30-35", 360)
put("179 THB", 480, scale=1.3, color=(120, 60, 0), thickness=3)

path = os.path.join(OUT, "placeholder_big_30_35.jpg")
cv2.imwrite(path, img, [cv2.IMWRITE_JPEG_QUALITY, 92])
print("wrote", path, os.path.getsize(path), "bytes")
