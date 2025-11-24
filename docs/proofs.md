# 🧪 Preuves de Validation (Persistance)
Test effectué le lun. 24 nov. 2025 21:21:28 CET

## 1. État avant crash (Donnée présente)
```bash
root@debian:~$ psql -c 'SELECT * FROM todos;'
 id |           title           | completed |          created_at           
----+---------------------------+-----------+-------------------------------
  1 | PREUVE_FINALE_PERSISTANCE | f         | 2025-11-24 20:21:29.176049+00
(1 row)

```
## 2. État après crash (Donnée toujours là)
Ancien Pod : postgres-deployment-55d9b9f76c-g64bk / Nouveau Pod : postgres-deployment-55d9b9f76c-mxwtz
```bash
root@debian:~$ psql -c 'SELECT * FROM todos;'
 id |           title           | completed |          created_at           
----+---------------------------+-----------+-------------------------------
  1 | PREUVE_FINALE_PERSISTANCE | f         | 2025-11-24 20:21:29.176049+00
(1 row)

```
