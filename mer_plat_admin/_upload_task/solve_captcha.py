import cv2, numpy as np, os, json
OUT = os.path.dirname(os.path.abspath(__file__))

bg = cv2.imread(os.path.join(OUT, "originalImageBase64.png"), cv2.IMREAD_UNCHANGED)
piece = cv2.imread(os.path.join(OUT, "jigsawImageBase64.png"), cv2.IMREAD_UNCHANGED)
print("bg shape", bg.shape, "dtype", bg.dtype)
print("piece shape", piece.shape, "dtype", piece.dtype)

# convert to BGR + alpha
if bg.shape[2] == 4:
    bg_bgr = bg[:, :, :3]
else:
    bg_bgr = bg
if piece.shape[2] == 4:
    piece_bgr = piece[:, :, :3]
    piece_alpha = piece[:, :, 3]
else:
    piece_bgr = piece
    piece_alpha = None

print("piece alpha range", piece_alpha.min(), piece_alpha.max() if piece_alpha is not None else "N/A")
print("piece bgr mean", piece_bgr.reshape(-1,3).mean(axis=0))

# template matching using alpha mask
if piece_alpha is not None:
    mask = (piece_alpha > 0).astype(np.uint8) * 255
    res = cv2.matchTemplate(bg_bgr, piece_bgr, cv2.TM_CCOEFF_NORMED, mask=mask)
else:
    res = cv2.matchTemplate(bg_bgr, piece_bgr, cv2.TM_CCOEFF_NORMED)
print("match result shape", res.shape)
minv, maxv, minloc, maxloc = cv2.minMaxLoc(res)
print("best match loc (x,y):", maxloc, "score", maxv)
print("x =", maxloc[0])
