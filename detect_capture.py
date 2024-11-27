import cv2
import numpy as np
import time
import os

# เริ่มการจับภาพจากกล้อง
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

# ตัวแปรสำหรับเก็บจำนวนการตรวจพบหน้ากาก
mask_count = 0

# ตัวแปรเพื่อติดตามสถานะการตรวจพบหน้ากากในเฟรมก่อนหน้า
mask_detected_in_previous_frame = False

# ตัวแปรสำหรับเก็บสถานะการใส่หน้ากาก
mask_status = "No Mask Detected"

# กำหนดเวลาสำหรับการบันทึกภาพ
last_capture_time = time.time()

# กำหนด gap time ก่อนจะบันทึกภาพอีกครั้ง (วินาที)
gap_time = 15

# ตรวจสอบและสร้างไดเร็กทอรีสำหรับเก็บรูปภาพ
output_dir = "public/captured_images"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

while True:
    # อ่านเฟรมจากกล้อง
    ret, frame = cap.read()

    if not ret:
        print("Error: Failed to capture image")
        break

    # กำหนดขนาดของเฟรม
    height, width, _ = frame.shape

    # กำหนดขนาดของช่องการค้นหาที่อยู่กึ่งกลางเฟรม
    box_size = 200
    center_x, center_y = width // 2, height // 2
    top_left_x = center_x - box_size // 2
    top_left_y = center_y - box_size // 2
    bottom_right_x = center_x + box_size // 2
    bottom_right_y = center_y + box_size // 2

    # ตัดเฉพาะพื้นที่กึ่งกลางสำหรับการตรวจจับหน้ากาก
    roi = frame[top_left_y:bottom_right_y, top_left_x:bottom_right_x]

    # แปลงภาพเป็นโทนสี HSV
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)

    # กำหนดช่วงสีของหน้ากาก (สีเขียวในกรณีนี้)
    lower_green = np.array([40, 50, 50])
    upper_green = np.array([80, 255, 255])

    # สร้าง mask ที่ระบุพื้นที่ที่ตรงกับสีที่กำหนด
    mask = cv2.inRange(hsv, lower_green, upper_green)

    # หาพื้นที่ที่เป็นหน้ากากในภาพ
    contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    mask_detected = False  # ตั้งค่าว่าหน้ากากยังไม่ถูกตรวจพบในเฟรมนี้

    for contour in contours:
        area = cv2.contourArea(contour)
        if area > 500:  # ตรวจสอบว่าพื้นที่ใหญ่พอสมควรที่จะเป็นหน้ากาก
            x, y, w, h = cv2.boundingRect(contour)
            cv2.rectangle(roi, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(roi, "Mask Detected", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0), 2)
            
            mask_detected = True  # ตรวจพบหน้ากากในเฟรมนี้

    # ถ้าตรวจพบหน้ากากในเฟรมนี้แต่ไม่ใช่ในเฟรมก่อนหน้า ให้เพิ่มตัวนับ
    if mask_detected and not mask_detected_in_previous_frame:
        mask_count += 1
        mask_status = "OK"
    elif mask_detected:
        mask_status = "OK"
    else:
        mask_status = "No Mask Detected"

    # ตรวจสอบเวลาและบันทึกรูปภาพทุกๆ 15 วินาที
    current_time = time.time()
    if current_time - last_capture_time >= gap_time:
        # เพิ่มข้อความลงในเฟรมก่อนบันทึกรูปภาพ
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, f"Mask Count: {mask_count}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        cv2.putText(frame, f"Status: {mask_status}", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        cv2.putText(frame, timestamp, (10, height - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # บันทึกภาพ
        image_filename = os.path.join(output_dir, f"capture_{int(current_time)}.jpg")
        cv2.imwrite(image_filename, frame)
        print(f"Captured image: {image_filename}")
        last_capture_time = current_time

    # อัพเดทสถานะการตรวจพบหน้ากากสำหรับเฟรมถัดไป
    mask_detected_in_previous_frame = mask_detected

    # แสดงกรอบกึ่งกลางในเฟรมทั้งหมด และเปลี่ยนสีตามการตรวจจับหน้ากาก
    cv2.rectangle(frame, (top_left_x, top_left_y), (bottom_right_x, bottom_right_y), (0, 255, 0) if mask_detected else (255, 0, 0), 2)

    # แสดงจำนวนการนับหน้ากากที่ตรวจพบและสถานะปัจจุบัน
    cv2.putText(frame, f"Mask Count: {mask_count}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    cv2.putText(frame, f"Status: {mask_status}", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    # cv2.putText(frame, f"Captured image: {image_filename}", (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    # เพิ่ม timestamp ลงในเฟรม
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    cv2.putText(frame, timestamp, (10, height - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    # แสดงภาพผลลัพธ์
    cv2.imshow('Webcam - Press "q" to quit', frame)

    # ออกจากลูปเมื่อกด q
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# ปิดการจับภาพและหน้าต่างทั้งหมด
cap.release()
cv2.destroyAllWindows()
