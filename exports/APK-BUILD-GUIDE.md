# FabricGhar — APK বানানোর সম্পূর্ণ গাইড

App Store ছাড়াই Android ফোনে install করার জন্য APK ফাইল বানানোর ধাপ।

---

## ধাপ ১: API সার্ভার deploy করুন (একবারই)

APK যেহেতু ফোনে install হবে, তাই API সার্ভার Replit এর dev URL দিয়ে কাজ করবে না। **আগে publish করতে হবে।**

1. Replit এ উপরে **"Publish"** বাটনে ক্লিক করুন
2. Deploy টাইপ: **Autoscale** বা **Reserved VM** নিন
3. Deploy সম্পন্ন হলে আপনি একটা URL পাবেন, যেমন: `fabricghar-yourname.replit.app`
4. **এই URL টা মনে রাখুন** — পরে লাগবে।

> ⚠️ Database (PostgreSQL) ও deploy এর সময় production environment এ কপি হবে। যদি existing data রাখতে চান, deploy এর পর `DATABASE_URL` সঠিকভাবে set আছে কিনা চেক করুন।

---

## ধাপ ২: Expo account তৈরি করুন (ফ্রি)

1. https://expo.dev/signup এ গিয়ে একাউন্ট খুলুন (Gmail দিয়ে করতে পারেন)
2. ইমেইল ও password মনে রাখুন

---

## ধাপ ৩: EAS CLI ইনস্টল করুন

Replit এর Shell খুলে এই কমান্ড চালান:

```bash
npm install -g eas-cli
```

ইনস্টল হয়েছে কিনা চেক:

```bash
eas --version
```

---

## ধাপ ৪: Expo এ login করুন

Shell এ চালান:

```bash
eas login
```

আপনার Expo account এর ইমেইল ও password দিন।

---

## ধাপ ৫: প্রজেক্টকে EAS এর সাথে যুক্ত করুন

```bash
cd artifacts/mobile
eas init
```

এটা automatically `app.json` এ একটা `projectId` বসিয়ে দেবে। (`REPLACE_AFTER_RUNNING_EAS_INIT` লেখাটা সরে যাবে)

---

## ধাপ ৬: Deployed API URL সেট করুন

`artifacts/mobile/eas.json` ফাইল খুলুন। `preview` profile এর ভেতরে এই লাইনটা খুঁজুন:

```json
"EXPO_PUBLIC_DOMAIN": "REPLACE_WITH_YOUR_DEPLOYED_API_DOMAIN"
```

`REPLACE_WITH_YOUR_DEPLOYED_API_DOMAIN` এর জায়গায় ধাপ ১ এর URL বসান (https:// ছাড়া)। যেমন:

```json
"EXPO_PUBLIC_DOMAIN": "fabricghar-yourname.replit.app"
```

`production` profile এর জন্যও একই কাজ করুন।

---

## ধাপ ৭: APK Build শুরু করুন!

```bash
pnpm --filter @workspace/mobile run apk
```

অথবা directly:

```bash
cd artifacts/mobile
eas build --platform android --profile preview
```

এটা চালালে:
1. কোডটা Expo এর cloud সার্ভারে যাবে
2. সেখানে APK build হবে (১০-২০ মিনিট লাগবে)
3. শেষে একটা **download link** দেখাবে — যেমন: `https://expo.dev/artifacts/eas/abc123.apk`
4. এই URL টা আপনার ফোনের browser এ খুলে download করুন

---

## ধাপ ৮: ফোনে install করুন

1. APK ফাইল ফোনে download হলে সেটা tap করুন
2. Android বলবে "Install unknown apps allowed nai" — Settings এ গিয়ে এই app (Chrome/Files যেটা দিয়ে খুলেছেন) এর জন্য **"Allow from this source"** চালু করুন
3. ফিরে এসে **Install** চাপুন
4. শেষ! FabricGhar এখন আপনার ফোনে।

---

## নতুন version বানালে কী করবেন?

কোডে পরিবর্তন করার পর নতুন APK বানাতে:

1. `app.json` এ `android.versionCode` বাড়ান (1 → 2 → 3 ...)
2. `app.json` এ `version` বাড়ান (1.0.0 → 1.0.1 → 1.1.0 ...)
3. আবার `pnpm --filter @workspace/mobile run apk` চালান

---

## সমস্যা হলে

| সমস্যা | সমাধান |
|---|---|
| `eas: command not found` | `npm install -g eas-cli` আবার চালান |
| Build fail হচ্ছে | EAS এর dashboard (expo.dev) এ গিয়ে log পড়ুন |
| App চালু হলেও "সংযোগ ব্যর্থ" দেখাচ্ছে | `EXPO_PUBLIC_DOMAIN` ঠিকমতো set হয়নি — `eas.json` চেক করে আবার build করুন |
| ফ্রি tier shesh | মাসে ৩০টা build পাবেন, পরের মাসে আবার পাবেন |

---

## ফ্রি tier এর সীমা

- **EAS Build:** মাসে ৩০টা ফ্রি cloud build
- **প্রতিটা build:** ১০-২০ মিনিট
- **APK ফাইল:** আপনার যত খুশি copy/share করতে পারবেন (.apk ফাইল চিরদিনের জন্য আপনার)

---

## একনজরে কমান্ডগুলো

```bash
# এক-বারের সেটআপ
npm install -g eas-cli
eas login
cd artifacts/mobile
eas init

# প্রতিবার APK বানাতে
pnpm --filter @workspace/mobile run apk
```

ব্যস! এই গাইডটা সেভ করে রাখুন। পরবর্তীতে যেকোনো সময় APK বানাতে পারবেন।
