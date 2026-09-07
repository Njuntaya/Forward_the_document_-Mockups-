# Sprint 1 — โครงสร้างงาน

โครงการ: **เว็บแอปพลิเคชันคำร้องขอเอกสารสำหรับนักศึกษา**
(ยื่นคำร้อง → อนุมัติ → ออกเอกสาร PDF พร้อม QR Code)

- งบประมาณ: 150,000 บาท (พัฒนา 110,000 / ทดสอบและอบรม 25,000 / สำรอง 15,000)
- ระยะเวลา: 1 พ.ย. 2569 – 28 ก.พ. 2570 (16 สัปดาห์)
- ทีมงาน: PM 1 คน, Developer 2 คน, Tester 1 คน

## โครงสร้างไฟล์

```
sprint-1/
├── README.md
├── .gitignore
├── docs/
│   ├── T1.1_project_plan.md              # เอกสาร Project Plan (ขอบเขต งบประมาณ WBS)
│   ├── T1.2_correction_register.md       # ตาราง Correction Register (บันทึกบั๊ก)
│   ├── T1.3_requirements_specification.md# Requirements Specification (FR, NFR) + ช่องลงนาม
│   └── T1.5_traceability_matrix.md       # Traceability Matrix (Requirement → Source Code)
```

## รายการงาน Sprint 1

| Task ID | รายละเอียดงาน | อ้างอิง Requirement | ผู้รับผิดชอบ | ไฟล์ |
|---|---|---|---|---|
| T1.1 | จัดทำเอกสาร Project Plan (ระบุขอบเขต งบประมาณ WBS) | Task 1.1 | PM | `docs/T1.1_project_plan.md` |
| T1.2 | สร้างตาราง Correction Register ไว้สำหรับบันทึกบั๊ก | Task 1.2 | PM | `docs/T1.2_correction_register.md` |
| T1.3 | สรุป Requirements Specification (FR, NFR) พร้อมช่องลงนาม | Task 2.1 | PM, Tester | `docs/T1.3_requirements_specification.md` |
| T1.4 | ออกแบบ Database Schema และสร้างฐานข้อมูล (เช่น MariaDB/SQL) | Project Setup | Dev 1, Dev 2 | `database/T1.4_schema.sql` |
| T1.5 | จัดทำ Traceability Matrix เชื่อมโยง Requirement ไปสู่ Source Code | Task 2.2 | Tester, Dev | `docs/T1.5_traceability_matrix.md` |

## แนวทาง Git

แนะนำให้สร้าง branch แยกสำหรับ Sprint 1 แล้ว commit เป็นราย Task เพื่อให้ตรวจสอบย้อนกลับง่าย:

```bash
git checkout -b feature/sprint-1
git add docs/T1.1_project_plan.md
git commit -m "T1.1: จัดทำเอกสาร Project Plan"

git add docs/T1.2_correction_register.md
git commit -m "T1.2: สร้างตาราง Correction Register"

git add docs/T1.3_requirements_specification.md
git commit -m "T1.3: สรุป Requirements Specification (FR, NFR)"

git add database/T1.4_schema.sql database/README.md
git commit -m "T1.4: ออกแบบและสร้าง Database Schema"

git add docs/T1.5_traceability_matrix.md
git commit -m "T1.5: จัดทำ Traceability Matrix"

git push origin feature/sprint-1
``
