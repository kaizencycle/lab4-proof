```
# Lab4-Proof 🚀

This project is the foundation of the HIVE ecosystem, combining a **FastAPI backend** with a **Next.js frontend**.

---

## 📂 Structure
- **app/** → FastAPI backend (ledger, hashing, storage, API endpoints)  
- **reflections/** → Next.js frontend (Reflections app UI)  
- **scripts/** → Helper scripts (signing, utilities)  
- **tests/** → Automated testing & validation  
- **backups/** → Ledger snapshots (JSON / ZIP)  

---

## ⚙️ Setup

### Backend (FastAPI)
```bash
cd app
pip install -r ../requirements.txt
uvicorn main:app --reload

```
