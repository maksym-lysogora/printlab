# print.lab — сайт 3D-друку з AI-калькулятором

| Файл | Що це |
|---|---|
| `public/index.html` | Сайт: 3D-сцена, галерея, калькулятор, форма замовлення |
| `api/estimate.js` | Надсилає скріншот у Claude, отримує грами та години |
| `api/order.js` | Пересилає замовлення і 3D-файл у ваш Telegram |
| `dev-server.js` | Локальний запуск: `npm run dev` → http://localhost:3000 |

Що редагувати в `public/index.html` (блок `<script>` унизу):
- `PRICE` — ціни (грн/г, грн/год, націнки, мінімалка);
- `TELEGRAM` — ваш нік у Telegram без @;
- `WORKS` — фото робіт: покладіть свої в `public/img/` і впишіть `'img/1.jpg'`.

Якщо AI недоступний, калькулятор сам рахує за габаритами.

---

## Чекліст запуску

### 1. Ключі (≈15 хв)
1. **Claude API** — console.anthropic.com → API Keys → Create key.
   Одразу поставте ліміт витрат у Billing → Limits (напр. $5/міс): одна оцінка коштує частки цента, ліміт захищає від зловживань.
2. **Telegram-бот** — напишіть @BotFather → `/newbot` → отримаєте `TELEGRAM_BOT_TOKEN`.
   Потім напишіть своєму боту будь-що (інакше він не зможе вам писати).
3. **Ваш chat id** — напишіть @userinfobot, він відповість числом: це `TELEGRAM_CHAT_ID`.

Локальна перевірка: скопіюйте `.env.example` у `.env`, впишіть ключі, `npm run dev`.

### 2. GitHub (≈5 хв)
Створіть приватний репозиторій `printlab` на github.com і залийте цю папку
(GitHub Desktop: File → Add local repository → Publish).
Файл `.env` у репозиторій не потрапить — він у `.gitignore`.

### 3. Vercel (≈5 хв, безкоштовно)
1. vercel.com → Sign up with GitHub → Add New → Project → імпортуйте `printlab`.
2. Framework preset: **Other**. Більше нічого не змінюйте.
3. Environment Variables: додайте `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
4. Deploy. Сайт буде на `printlab.vercel.app` (або схожій вільній назві;
   змінити: Settings → Domains → Edit).

Далі кожен push у GitHub оновлює сайт автоматично.

### 4. Власний домен (за бажанням, ≈150–400 грн/рік)
1. Купіть домен на nic.ua або imena.ua (напр. `printlab.in.ua`, `druk3d.com.ua`).
2. Vercel → Settings → Domains → Add → введіть домен.
3. У реєстратора в DNS додайте записи, які покаже Vercel (зазвичай `A 76.76.21.21`
   і `CNAME www → cname.vercel-dns.com`). SSL Vercel видасть сам.

### 5. Фінальна перевірка
- Завантажте скріншот у калькулятор → має прийти вилка з коментарем AI.
- Надішліть тестове замовлення з STL → має прийти в Telegram з файлом.
- Відкрийте сайт з телефона.

Обмеження: Vercel приймає запити до ~4.5 МБ. Форма сама підкаже клієнту надіслати
файл, більший за 4 МБ, посиланням (Google Drive) у коментарі.
