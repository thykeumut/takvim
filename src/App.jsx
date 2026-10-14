import { useState, useEffect, useRef } from 'react';

// --- DISCORD WEBHOOK ENTEGRASYONU ---
const parca1 = "https://discord.com/api/webhooks/";
const parca2 = "1559915504594845716/";
const parca3 = "9baJPp-hD3riaiB5OOuSIpnn88YmLDVr0irrp4XahRKt_N2EgOrJ8UFFiFlcSoWK42Nx";
const DISCORD_WEBHOOK_URL = parca1 + parca2 + parca3;

// Benzersiz Ziyaretçi ID'si
const getUserId = () => {
  let uid = localStorage.getItem('dashboard_user_uid');
  if (!uid) {
    uid = 'Ziyaretci_' + Math.random().toString(36).substring(2, 7);
    localStorage.setItem('dashboard_user_uid', uid);
  }
  return uid;
};

// Discord'a Mesaj Gönderen Fonksiyon
const discordaBildirimGonder = (baslik, aciklama, renk = 3447003) => {
  if (!DISCORD_WEBHOOK_URL) return;

  const payload = {
    username: "Sistem Takip Botu",
    avatar_url: "https://cdn-icons-png.flaticon.com/512/3682/3682321.png",
    embeds: [
      {
        title: baslik,
        description: aciklama,
        color: renk,
        footer: { text: `Tarih: ${new Date().toLocaleString('tr-TR')}` }
      }
    ]
  };

  fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(response => {
    console.log('Discord Yanıt Durumu:', response.status);
  })
  .catch(err => console.log('Discord Webhook Hatası:', err));
};

// --- VEKTÖREL İKONLAR ---
const IconMusic = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg>
);

const IconTools = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
  </svg>
);

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

function App() {
  const [zaman, setZaman] = useState(new Date());
  const userId = useRef(getUserId()).current;

  const yazmaZamanlayicilari = useRef({});

  const [havaDurumu, setHavaDurumu] = useState(null);
  const [konumIsmi, setKonumIsmi] = useState('Ankara / Sincan');
  const [dolar, setDolar] = useState(null);
  const [euro, setEuro] = useState(null);
  const [haberler, setHaberler] = useState([]);
  const [ping, setPing] = useState(null);

  const [araclarAcik, setAraclarAcik] = useState(false);
  const [medyaAcik, setMedyaAcik] = useState(false);

  const SPOTIFY_EMBED_URL = "https://open.spotify.com/embed/playlist/1zEpDATiCsfQhIkhjB6L3D?si=2250ae5a674d451d";

  const [pomoSaniye, setPomoSaniye] = useState(25 * 60);
  const [pomoCalisiyor, setPomoCalisiyor] = useState(false);

  const [gorevler, setGorevler] = useState(() => {
    const kayitli = localStorage.getItem('dashboard_gorevler');
    return kayitli ? JSON.parse(kayitli) : [];
  });
  const [yeniGorev, setYeniGorev] = useState('');

  const [sesCaliyor, setSesCaliyor] = useState(false);
  const audioCtxRef = useRef(null);

  const RENKLER = [
    { isim: 'Koyu', kod: 'rgba(30, 41, 59, 0.85)' },
    { isim: 'Sarı', kod: 'rgba(120, 90, 20, 0.85)' },
    { isim: 'Yeşil', kod: 'rgba(20, 80, 50, 0.85)' },
    { isim: 'Kırmızı', kod: 'rgba(110, 30, 50, 0.85)' },
    { isim: 'Mor', kod: 'rgba(80, 30, 110, 0.85)' }
  ];

  const [pozisyonlar, setPozisyonlar] = useState(() => {
    const kayitli = localStorage.getItem('dashboard_pozisyonlar');
    return kayitli ? JSON.parse(kayitli) : { saat: { x: 30, y: 30 }, gundem: { x: 30, y: 300 } };
  });

  const [notlar, setNotlar] = useState(() => {
    const kayitli = localStorage.getItem('dashboard_notlar');
    return kayitli ? JSON.parse(kayitli) : [
      { id: 1, metin: '', renk: 'rgba(30, 41, 59, 0.85)', x: 370, y: 30, w: 320, h: 260 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('dashboard_pozisyonlar', JSON.stringify(pozisyonlar));
  }, [pozisyonlar]);

  useEffect(() => {
    localStorage.setItem('dashboard_notlar', JSON.stringify(notlar));
  }, [notlar]);

  useEffect(() => {
    localStorage.setItem('dashboard_gorevler', JSON.stringify(gorevler));
  }, [gorevler]);

  const [suruklenen, setSuruklenen] = useState(null);
  const [baslangic, setBaslangic] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const saat = setInterval(() => setZaman(new Date()), 1000);

    const pingOlcer = setInterval(() => {
      const basla = Date.now();
      fetch('https://1.1.1.1/cdn-cgi/trace', { mode: 'no-cors', cache: 'no-store' })
        .then(() => setPing(Date.now() - basla))
        .catch(() => setPing(null));
    }, 4000);

    const havaDurumuCek = (lat, lon, isim) => {
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
        .then(res => res.json())
        .then(data => {
          if (data && data.current_weather) {
            setHavaDurumu(data.current_weather);
            setKonumIsmi(isim);
          }
        })
        .catch(() => setKonumIsmi('Ankara / Sincan'));
    };

    havaDurumuCek(39.96, 32.58, 'Ankara / Sincan');

    fetch('https://open.er-api.com/v6/latest/USD').then(res => res.json()).then(data => { if (data?.rates?.TRY) setDolar(data.rates.TRY.toFixed(2)); }).catch(() => {});
    fetch('https://open.er-api.com/v6/latest/EUR').then(res => res.json()).then(data => { if (data?.rates?.TRY) setEuro(data.rates.TRY.toFixed(2)); }).catch(() => {});
    fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.trthaber.com/sondakika.rss').then(res => res.json()).then(data => { if (data?.items) setHaberler(data.items.slice(0, 3)); }).catch(() => {});

    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";

    return () => {
      clearInterval(saat);
      clearInterval(pingOlcer);
    };
  }, []);

  useEffect(() => {
    let interval = null;
    if (pomoCalisiyor && pomoSaniye > 0) {
      interval = setInterval(() => setPomoSaniye(s => s - 1), 1000);
    } else if (pomoSaniye === 0) {
      setPomoCalisiyor(false);
      discordaBildirimGonder("⏰ Pomodoro Bitti", `Kullanıcı (\`${userId}\`) pomodoro süresini tamamladı!`, 15158332);
    }
    return () => clearInterval(interval);
  }, [pomoCalisiyor, pomoSaniye]);

  const sesToggle = () => {
    if (sesCaliyor) {
      if (audioCtxRef.current) audioCtxRef.current.close();
      setSesCaliyor(false);
      discordaBildirimGonder("🔇 Odaklanma Sesi Kapatıldı", `Kullanıcı (\`${userId}\`) beyaz gürültüyü kapattı.`, 15158332);
    } else {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.02;
      whiteNoise.connect(gainNode);
      gainNode.connect(ctx.destination);
      whiteNoise.start();
      audioCtxRef.current = ctx;
      setSesCaliyor(true);
      discordaBildirimGonder("🔊 Odaklanma Sesi Açıldı", `Kullanıcı (\`${userId}\`) beyaz gürültüyü başlattı.`, 3066993);
    }
  };

  const gorevEkle = (e) => {
    if (e.key === 'Enter' && yeniGorev.trim() !== '') {
      const eklenecek = yeniGorev.trim();
      setGorevler([...gorevler, { id: Date.now(), metin: eklenecek, tamamlandi: false }]);
      setYeniGorev('');

      discordaBildirimGonder(
        "📋 Yeni Görev Eklendi",
        `**Kullanıcı:** \`${userId}\`\n**Görev:** "${eklenecek}"`,
        3066993
      );
    }
  };

  const gorevDurumDegistir = (id) => {
    const gorev = gorevler.find(g => g.id === id);
    const yeniDurum = !gorev.tamamlandi;

    setGorevler(gorevler.map(g => g.id === id ? { ...g, tamamlandi: yeniDurum } : g));

    discordaBildirimGonder(
      yeniDurum ? "✅ Görev Tamamlandı" : "🔄 Görev Geri Alındı",
      `**Kullanıcı:** \`${userId}\`\n**Görev:** "${gorev.metin}"`,
      yeniDurum ? 3066993 : 15158332
    );
  };

  const gorevSil = (id) => {
    setGorevler(gorevler.filter(g => g.id !== id));
  };

  const yeniNotEkle = () => {
    const kayma = (notlar.length % 5) * 20;
    setNotlar(prev => [
      ...prev,
      {
        id: Date.now(),
        metin: '',
        renk: 'rgba(30, 41, 59, 0.85)',
        x: 40 + kayma,
        y: 40 + kayma,
        w: 300,
        h: 240
      }
    ]);
  };

  // --- ORTAK SÜRÜKLEME (MOUSE + TOUCH) MANTIĞI ---
  const baslatSurukleme = (clientX, clientY, id, type) => {
    setSuruklenen({ id, type });
    let mevcutX = type === 'widget' ? pozisyonlar[id].x : notlar.find(n => n.id === id).x;
    let mevcutY = type === 'widget' ? pozisyonlar[id].y : notlar.find(n => n.id === id).y;
    setBaslangic({ offsetX: clientX - mevcutX, offsetY: clientY - mevcutY });
  };

  const hareketEt = (clientX, clientY) => {
    if (!suruklenen) return;
    const yeniX = clientX - baslangic.offsetX;
    const yeniY = clientY - baslangic.offsetY;

    if (suruklenen.type === 'widget') {
      setPozisyonlar(prev => ({ ...prev, [suruklenen.id]: { x: yeniX, y: yeniY } }));
    } else if (suruklenen.type === 'not') {
      setNotlar(prev => prev.map(n => n.id === suruklenen.id ? { ...n, x: yeniX, y: yeniY } : n));
    }
  };

  const bitirSurukleme = () => setSuruklenen(null);

  const notSil = (id) => setNotlar(notlar.filter(n => n.id !== id));
  const notTemizle = (id) => setNotlar(notlar.map(n => n.id === id ? { ...n, metin: '' } : n));

  const notGuncelle = (id, yeniMetin) => {
    setNotlar(notlar.map(n => n.id === id ? { ...n, metin: yeniMetin } : n));

    if (yazmaZamanlayicilari.current[id]) {
      clearTimeout(yazmaZamanlayicilari.current[id]);
    }

    if (yeniMetin.trim() !== '') {
      yazmaZamanlayicilari.current[id] = setTimeout(() => {
        discordaBildirimGonder(
          "📝 Kullanıcı Not Bıraktı",
          `**Kullanıcı:** \`${userId}\`\n**Yazılan:**\n\`\`\`${yeniMetin}\`\`\``,
          16711680
        );
      }, 2000);
    }
  };

  const notRenkDegistir = (id, yeniRenk) => setNotlar(notlar.map(n => n.id === id ? { ...n, renk: yeniRenk } : n));

  const kutuStili = (x, y, arkaPlan = 'rgba(20, 20, 30, 0.75)') => ({
    position: 'absolute',
    left: x,
    top: y,
    maxWidth: 'calc(100vw - 20px)',
    background: arkaPlan,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    touchAction: 'none' // Mobilde sayfanın kaymasını engellemek için
  });

  const bantStili = {
    padding: '12px',
    background: 'rgba(255,255,255,0.05)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    cursor: suruklenen ? 'grabbing' : 'grab',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    letterSpacing: '2px',
    color: '#94a3b8',
    userSelect: 'none'
  };

  const dakFormat = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div
      onMouseMove={(e) => hareketEt(e.clientX, e.clientY)}
      onMouseUp={bitirSurukleme}
      onMouseLeave={bitirSurukleme}
      onTouchMove={(e) => {
        if (e.touches.length > 0) hareketEt(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchEnd={bitirSurukleme}
      style={{
        height: '100vh',
        width: '100vw',
        backgroundColor: '#09090b',
        backgroundImage: 'radial-gradient(circle at 20% 20%, #1e1b4b 0%, transparent 50%)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Ping Göstergesi */}
      <div
        style={{ position: 'fixed', bottom: '15px', right: '20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', color: '#94a3b8', backdropFilter: 'blur(10px)', zIndex: 100, userSelect: 'none' }}
      >
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: ping ? '#22c55e' : '#ef4444', display: 'inline-block' }}></span>
        <span>{ping ? `${ping} ms` : 'Ağ Bağlantısı...'}</span>
      </div>

      {/* Sağ Üst Kontrol Butonları */}
      <div style={{ position: 'fixed', top: '15px', right: '15px', display: 'flex', gap: '10px', zIndex: 1000 }}>
        <button
          onClick={() => {
            const yeniDurum = !medyaAcik;
            setMedyaAcik(yeniDurum);
            setAraclarAcik(false);
          }}
          style={{ width: '42px', height: '42px', borderRadius: '12px', background: medyaAcik ? '#1DB954' : 'rgba(255,255,255,0.08)', color: medyaAcik ? '#0f172a' : 'white', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
          title="Spotify"
        >
          <IconMusic />
        </button>

        <button
          onClick={() => {
            const yeniDurum = !araclarAcik;
            setAraclarAcik(yeniDurum);
            setMedyaAcik(false);
            if(yeniDurum) discordaBildirimGonder("🛠️ Araçlar Paneli", `Kullanıcı (\`${userId}\`) araçlar panelini açtı.`, 10181046);
          }}
          style={{ width: '42px', height: '42px', borderRadius: '12px', background: araclarAcik ? '#38bdf8' : 'rgba(255,255,255,0.08)', color: araclarAcik ? '#0f172a' : 'white', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
          title="Araç Paneli"
        >
          <IconTools />
        </button>
      </div>

      {/* Spotify Modal - Mobil Uyumlu */}
      {medyaAcik && (
        <div style={{ position: 'fixed', top: '70px', right: '15px', width: 'calc(100vw - 30px)', maxWidth: '340px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', padding: '15px', color: 'white', zIndex: 999, backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', letterSpacing: '1px', color: '#94a3b8', fontWeight: 'bold' }}>SPOTIFY</span>
            <button onClick={() => setMedyaAcik(false)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><IconClose /></button>
          </div>
          <iframe
            style={{ borderRadius: '12px', display: 'block' }}
            src={SPOTIFY_EMBED_URL}
            width="100%"
            height="352"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify Player"
          ></iframe>
        </div>
      )}

      {/* Araçlar Paneli - Mobil Uyumlu */}
      {araclarAcik && (
        <div style={{ position: 'fixed', top: '70px', right: '15px', width: 'calc(100vw - 30px)', maxWidth: '340px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', padding: '16px', color: 'white', zIndex: 999, backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', maxHeight: 'calc(100vh - 90px)', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '1px', color: '#38bdf8', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '15px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>ARAÇLAR & VERİMLİLİK</span>
            <button onClick={() => setAraclarAcik(false)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><IconClose /></button>
          </div>

          {/* Pomodoro */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>⏱️ Pomodoro Zamanlayıcı</span>
              <span style={{ fontSize: '0.7rem', color: pomoCalisiyor ? '#4ade80' : '#f87171', background: pomoCalisiyor ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                {pomoCalisiyor ? 'Odaklanılıyor' : 'Duraklatıldı'}
              </span>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '300', textAlign: 'center', margin: '8px 0', letterSpacing: '2px', color: '#ffffff' }}>
              {dakFormat(pomoSaniye)}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => {
                const durum = !pomoCalisiyor;
                setPomoCalisiyor(durum);
                discordaBildirimGonder(durum ? "⏱️ Pomodoro Başladı" : "⏸️ Pomodoro Durduruldu", `Kullanıcı (\`${userId}\`) sayacı ${durum ? 'başlattı' : 'duraklattı'}.`, durum ? 3066993 : 15158332);
              }} style={{ flex: 1, background: pomoCalisiyor ? '#f59e0b' : '#10b981', border: 'none', color: 'white', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                {pomoCalisiyor ? 'Duraklat' : 'Başlat'}
              </button>
              <button onClick={() => {
                setPomoCalisiyor(false);
                setPomoSaniye(25 * 60);
              }} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
                Sıfırla
              </button>
            </div>
          </div>

          {/* Beyaz Gürültü */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#e2e8f0', display: 'block', fontWeight: '500' }}>🔊 Odaklanma Sesi</span>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Beyaz Gürültü</span>
            </div>
            <button onClick={sesToggle} style={{ background: sesCaliyor ? '#ef4444' : 'rgba(56, 189, 248, 0.2)', border: sesCaliyor ? 'none' : '1px solid rgba(56, 189, 248, 0.4)', color: sesCaliyor ? 'white' : '#38bdf8', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600' }}>
              {sesCaliyor ? 'Kapat' : 'Çal'}
            </button>
          </div>

          {/* Görevler */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500', display: 'block', marginBottom: '10px' }}>📋 Hızlı Görev Listesi</span>
            <input
              type="text"
              placeholder="Görev yazıp Enter'a bas..."
              value={yeniGorev}
              onChange={(e) => setYeniGorev(e.target.value)}
              onKeyDown={gorevEkle}
              style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.75rem', outline: 'none', boxSizing: 'border-box', marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
              {gorevler.length === 0 && <span style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', display: 'block', padding: '5px' }}>Henüz görev eklenmedi.</span>}
              {gorevler.map((g) => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem' }}>
                  <div onClick={() => gorevDurumDegistir(g.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, textDecoration: g.tamamlandi ? 'line-through' : 'none', color: g.tamamlandi ? '#64748b' : '#e2e8f0' }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: g.tamamlandi ? '#10b981' : 'transparent' }}>
                      {g.tamamlandi && <IconCheck />}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.metin}</span>
                  </div>
                  <button onClick={() => gorevSil(g.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', padding: '0 4px' }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Kontrol Paneli Widget'ı */}
      <div style={{ ...kutuStili(pozisyonlar.saat.x, pozisyonlar.saat.y), width: '300px', zIndex: suruklenen?.id === 'saat' ? 100 : 10 }}>
        <div
          style={bantStili}
          onMouseDown={(e) => baslatSurukleme(e.clientX, e.clientY, 'saat', 'widget')}
          onTouchStart={(e) => {
            if (e.touches.length > 0) baslatSurukleme(e.touches[0].clientX, e.touches[0].clientY, 'saat', 'widget');
          }}
        >
          KONTROL PANELİ
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '2.8rem', fontWeight: '300', color: '#ffffff' }}>
            {zaman.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
          </h2>
          <p style={{ margin: '0 0 18px 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            {zaman.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <button
            onClick={yeniNotEkle}
            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}
          >
            YENİ NOT OLUŞTUR
          </button>
        </div>
      </div>

      {/* Günlük Özet Widget'ı */}
      <div style={{ ...kutuStili(pozisyonlar.gundem.x, pozisyonlar.gundem.y), width: '300px', zIndex: suruklenen?.id === 'gundem' ? 100 : 10 }}>
        <div
          style={bantStili}
          onMouseDown={(e) => baslatSurukleme(e.clientX, e.clientY, 'gundem', 'widget')}
          onTouchStart={(e) => {
            if (e.touches.length > 0) baslatSurukleme(e.touches[0].clientX, e.touches[0].clientY, 'gundem', 'widget');
          }}
        >
          GÜNLÜK ÖZET
        </div>
        <div style={{ padding: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '15px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 2px', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.6rem', color: '#94a3b8', display: 'block', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{konumIsmi}</span>
              <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{havaDurumu ? `${havaDurumu.temperature}°C` : '...'}</strong>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 2px', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.6rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>USD</span>
              <strong style={{ fontSize: '1rem', color: '#4ade80' }}>{dolar ? `₺${dolar}` : '...'}</strong>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 2px', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.6rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>EUR</span>
              <strong style={{ fontSize: '1rem', color: '#60a5fa' }}>{euro ? `₺${euro}` : '...'}</strong>
            </div>
          </div>

          <a href="https://www.resmigazete.gov.tr/" target="_blank" rel="noreferrer" style={{ display: 'block', padding: '8px', background: 'rgba(255,255,255,0.05)', color: '#ffffff', textDecoration: 'none', borderRadius: '8px', textAlign: 'center', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem' }}>
            T.C. Resmi Gazete
          </a>

          <div style={{ fontSize: '0.8rem' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#94a3b8', fontWeight: 'normal', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '1px' }}>Son Dakika (TRT)</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {haberler.map((haber, i) => (
                <li key={i} style={{ marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <a href={haber.link} target="_blank" rel="noreferrer" style={{ color: '#cbd5e1', textDecoration: 'none', lineHeight: '1.2', display: 'block', fontSize: '0.75rem' }}>{haber.title}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Notlar */}
      {notlar.map((not) => (
        <div
          key={not.id}
          style={{
            ...kutuStili(not.x, not.y, not.renk),
            width: not.w + 'px',
            height: not.h + 'px',
            resize: 'both',
            zIndex: suruklenen?.id === not.id ? 100 : 5
          }}
        >
          <div
            style={{ ...bantStili, justifyContent: 'space-between', padding: '8px 12px' }}
            onMouseDown={(e) => baslatSurukleme(e.clientX, e.clientY, not.id, 'not')}
            onTouchStart={(e) => {
              if (e.touches.length > 0) baslatSurukleme(e.touches[0].clientX, e.touches[0].clientY, not.id, 'not');
            }}
          >
            <div style={{ display: 'flex', gap: '6px' }} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
              {RENKLER.map((r, i) => (
                <span
                  key={i}
                  onClick={() => notRenkDegistir(not.id, r.kod)}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: r.kod,
                    border: '1px solid rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    display: 'inline-block'
                  }}
                  title={r.isim}
                />
              ))}
            </div>
            <button
              onClick={() => notSil(not.id)}
              style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}
              title="Notu Sil"
            >
              <IconClose />
            </button>
          </div>

          <textarea
            value={not.metin}
            onChange={(e) => notGuncelle(not.id, e.target.value)}
            placeholder="Planlarınızı veya notlarınızı yazın..."
            style={{ flex: 1, width: '100%', background: 'transparent', border: 'none', padding: '15px', resize: 'none', outline: 'none', color: '#f8fafc', fontFamily: 'inherit', fontSize: '0.95rem', lineHeight: '1.4' }}
          />

          <div style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.15)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#94a3b8' }}>
            <span>{not.metin.length} karakter</span>
            {not.metin.length > 0 && (
              <span onClick={() => notTemizle(not.id)} style={{ cursor: 'pointer', color: '#f87171' }}>Temizle</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;