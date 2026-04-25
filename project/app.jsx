const { useState, useEffect, useRef } = React;

// === Simple hash-based router ===
function useRoute() {
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/');
  useEffect(() => {
    const onHash = () => {
      setRoute(window.location.hash.slice(1) || '/');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

function navigate(path) {
  window.location.hash = path;
}

// Keyboard support for clickable divs that act as buttons.
// Spread onto an element to make it tabbable + Enter/Space activates.
function clickable(handler, label) {
  return {
    onClick: handler,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    },
    role: 'button',
    tabIndex: 0,
    'aria-label': label,
  };
}

function calcReadTime(text) {
  const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220)) + ' min';
}

function rawBlocks(raw) {
  const parts = (raw || '').trim().split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
  return parts.map((part) => {
    if (part === '---') return { type: 'break' };
    if (part.startsWith('### ')) return { type: 'h', text: part.slice(4).trim() };
    return { type: 'p', text: part };
  });
}

function renderRawInline(text) {
  const parts = text.split(/(\{\{ref:[^}]+\}\})/g);
  return parts.map((part, i) => {
    const m = part.match(/^\{\{ref:\s*(.+?)\s*\}\}$/);
    if (m) return <span key={i} className="raw-ref">{m[1]}</span>;
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function RawInfoButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="raw-info-btn"
        aria-label="About Raw — read first"
        onClick={() => setOpen(true)}
      >
        <em>i</em>
      </button>
      {open && ReactDOM.createPortal(
        <div className="raw-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="raw-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button
              type="button"
              className="raw-modal-close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <span className="raw-notice-label">A heads up.</span>
            <p>What's said here stays here — rough edges and all.</p>
            <p>If something doesn't line up with scripture, you'll see a verse reference in <span className="raw-notice-inline-ref">red</span> beside it. Not a correction — just the Word speaking too.</p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// === Nav ===
function Nav() {
  const goHome = (e) => {
    e.preventDefault();
    const onHome = window.location.hash === '' || window.location.hash === '#/';
    if (onHome) {
      window.scrollTo(0, 0);
    } else {
      navigate('/');
    }
  };
  const goBooks = (e) => {
    e.preventDefault();
    if (window.location.hash === '#/books') {
      window.scrollTo(0, 0);
    } else {
      navigate('/books');
    }
  };
  return (
    <nav className="nav">
      <a className="brand" href="#/books" onClick={goBooks} aria-label="Jesus the King — Books">
        Jesus <span className="brand-accent">the</span> King
      </a>
      <div className="nav-links">
        <a href="#/" onClick={goHome}>Home</a>
        <a href="#articles" onClick={(e) => {
          e.preventDefault();
          if (window.location.hash !== '#/') navigate('/');
          setTimeout(() => document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth' }), 100);
        }}>Reflect</a>
        <a href="#/raw" onClick={(e) => {e.preventDefault();navigate('/raw');}}>Raw</a>
        <a href="#/promise" onClick={(e) => {e.preventDefault();navigate('/promise');}}>Our Oath</a>
      </div>
    </nav>);

}

// === Marquee ===
function Marquee() {
  const line =
  <span style={{ fontWeight: 500 }}>
      Seek first the kingdom of God <span className="star">✦</span>
      Seek first the kingdom of God <span className="star">✦</span>
      Seek first the kingdom of God <span className="star">✦</span>
      Seek first the kingdom of God <span className="star">✦</span>
    </span>;

  return (
    <div className="marquee">
      <div className="marquee-track">
        {line}{line}
      </div>
    </div>);

}

// === Home ===
function Home() {
  const articles = window.ABIDE_ARTICLES;
  const [hover, setHover] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="fade-in">
      <section className="hero">
        <div className="hero-label">
          <span className="dot"></span>
          <span>Abide Bible Study Group</span>
          <span>·</span>
          <span>Vol. I / Spring 2026</span>
        </div>
        <h1 className="hero-title">Abide</h1>
        <div className="hero-sub">
          <div className="tagline">
            <em>"Remain in me, as I also remain in you."</em><br />
            — John 15:4
          </div>
          <div>Scroll <span style={{ color: 'var(--accent)' }}>↓</span></div>
        </div>
      </section>

      <div id="articles">
        <div className="section-head">
          <div>
            <span className="kicker">Weekly Study</span>
            <h2>Reflections.</h2>
          </div>
          <div className="count-pill">{articles.length} entries</div>
        </div>

        <div className="articles">
          <div className="article-card books-card" {...clickable(() => navigate('/books'), 'Read about Jesus the King')}>
            <div className="card-image">
              <img src="./uploads/jesus-the-king-flat.png?v=58" alt="" loading="lazy" decoding="async" />
            </div>
            <div className="card-body">
              <div className="pills">
                <span className="pill">Currently Reading</span>
                <span className="pill">Spring 2026</span>
              </div>
              <div className="card-title">Jesus the King</div>
              <div className="card-excerpt">Timothy Keller. The book we're walking through together this season — a meditation on the life and death of the Son of God through the Gospel of Mark.</div>
              <div className="tags">
                <span className="tag">the book</span>
                <span className="tag">timothy keller</span>
              </div>
            </div>
          </div>

          {articles.map((a, i) =>
          <div
            key={a.id}
            className="article-card"
            {...clickable(() => navigate('/article/' + a.id), `Read ${a.title}`)}>

              <div className="card-image">
                <img src={a.hero} alt="" loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
              </div>
              <div className="card-body">
                <div className="pills">
                  <span className="pill">{a.date}</span>
                  <span className="pill">{a.readTime} read</span>
                </div>
                <div className="card-title">{a.title}</div>
                <div className="card-excerpt">{a.excerpt}</div>
                <div className="tags">
                  <span className="tag">{a.category.toLowerCase()}</span>
                  <span className="tag">{a.verse.toLowerCase()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="article-card oath-card" {...clickable(() => navigate('/promise'), 'Read Our Oath')}>
            <div className="card-image oath-card-image">
              <span className="oath-headline">How We<br/>Use AI.</span>
            </div>
            <div className="card-body">
              <div className="pills">
                <span className="pill">Always</span>
                <span className="pill">3 min read</span>
              </div>
              <div className="card-title">Our Oath</div>
              <div className="card-excerpt">How we use AI here — our promise about scripture, voice, and the things we will not let a machine do with the Word of God.</div>
              <div className="tags">
                <span className="tag">transparency</span>
                <span className="tag">our promise</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Marquee />

      <footer className="footer">
        <div className="footer-bottom">
          <span>Abide Bible Study Group</span>
          <span>Tuesdays · 7:00 PM</span>
          <a href="#/promise" onClick={(e) => {e.preventDefault();navigate('/promise');}} className="footer-link">Our AI Promise</a>
          <span>© 2026</span>
          <span className="footer-credit">Powered by Martocci Media</span>
        </div>
      </footer>
    </div>);

}

// === Promise / AI Transparency page ===
function PromisePage() {
  return (
    <div className="promise-page fade-in">
      <article className="article-body promise-body">
        <a className="back-link" href="#/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          ← Back home
        </a>

        <div className="promise-header">
          <span className="kicker">Our Oath</span>
          <h1>How We Use AI.<span className="h1-aside">Carefully...</span></h1>
        </div>

        <p className="lede">
          Abide is a weekly Bible study. The articles on this site are written with the help of AI, shaped from transcripts of our gatherings. That tool is a faster way to remember what we talked about together — it is not a preacher, a theologian, or a substitute for scripture. This page is our promise to you about how it's used.
        </p>

        <h2>The Translation</h2>
        <p>
          When scripture is quoted on this site, it is quoted from the English Standard Version (ESV). We don't paraphrase the Word and present it as a quote. If you see a verse in quotation marks here, it is what the ESV actually says.
        </p>

        <h2>The Tradition</h2>
        <p>
          We are non-denominational. That means our center is scripture, not the particular tradition of any one branch of the church. You won't find us writing "as Reformed theology teaches" or "in the Catholic view" or "Pentecostals believe." We focus on what the Bible says and on what the group actually wrestled with that week.
        </p>

        <h2>Scripture Is the Source of Truth</h2>
        <p>
          The Bible is the authority here. Not the transcript. Not the group. Not the AI. If something came up in a conversation that isn't biblical, or was taken out of context, we don't repeat it on the page as if it were true. We either reframe it honestly or we point to what scripture actually says.
        </p>

        <div className="pullquote">"Scripture is the authority. Not the transcript. Not the group. Not the AI."</div>

        <h2>When a Question Goes Unanswered</h2>
        <p>
          Sometimes someone in the group asks an honest question — "What does the Bible actually say about this?" When scripture speaks to it directly, we'll show you the verse. The intent is simple: God answers more in His Word than we often remember, and part of the work of an article is to put those answers next to the questions.
        </p>
        <p>
          When we do this, we don't name the person who asked. We use neutral framings — "Someone in the group wondered…" or "A question came up about…" — and then let the verse speak.
        </p>

        <h2>When Something Isn't Quite Right</h2>
        <p>
          If a claim came up in the room that doesn't hold up against scripture, the article doesn't call the person out. It quietly turns to the Word: "The Bible paints a different picture in…" and cites the passage. The goal is not to shame — the goal is to let the truth of scripture do the correcting.
        </p>

        <h2>What the AI Will Not Do</h2>
        <p>
          An AI does not know what God knows. It cannot give spiritual direction that isn't already written in scripture, and it should never try. So here's the hard line we hold:
        </p>
        <p>
          If the Bible doesn't specifically address a question raised in a gathering, the article leaves that question honest and unanswered. We don't invent resolutions. We don't stretch a loosely related verse to make it fit. We don't speculate about what God "probably wants" or "is trying to teach us." There is a lot God has not given us clarity on, and part of walking with Him is living with that.
        </p>

        <div className="pullquote">"An AI does not know what God knows."</div>

        <h2>The Voice</h2>
        <p>
          We write plainly. No corporate jargon, no theological insider language the group didn't actually use, no tidy AI phrases dressed up to sound profound. The goal is to sound the way a thoughtful friend would sound recounting a real conversation — honest about tension, warm about people, clear about scripture.
        </p>

        <h2>Our Promise</h2>
        <p>
          What you read here is a reflection of a real room of real people trying to follow Jesus on a Tuesday night. The AI helps shape the recap. The Word of God does the teaching. We will hold that line every week.
        </p>

        <a className="back-link" href="#/" onClick={(e) => { e.preventDefault(); navigate('/'); }} style={{ marginTop: 48, display: 'inline-block' }}>
          ← Back home
        </a>
      </article>
    </div>
  );
}

// === Article page ===
function Article({ id }) {
  const articles = window.ABIDE_ARTICLES;
  const article = articles.find((a) => a.id === id);
  const idx = articles.findIndex((a) => a.id === id);
  const nextArticle = idx >= 0 && idx + 1 < articles.length ? articles[idx + 1] : null;

  if (!article) {
    return (
      <div style={{ padding: 120, textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 80 }}>Not Found</h1>
        <a href="#/" onClick={(e) => {e.preventDefault();navigate('/');}} style={{ color: 'var(--accent)' }}>← Back home</a>
      </div>);

  }

  return (
    <div className="article-page fade-in">
      <section className="article-hero">
        <div className="bg"><img src={article.hero} alt="" /></div>
        <div className="content">
          <div className="kicker">
            <span className="cat">{article.category}</span>
            <span>{article.date}</span>
            <span>{article.readTime}</span>
            <span>Week {parseInt(article.number, 10)}</span>
            <span>Entry {article.number}</span>
          </div>
          <h1>{article.title}</h1>
          <div className="verse">— {article.verse}</div>
        </div>
      </section>

      <article className="article-body">
        <a className="back-link" href="#/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          ← Back to Archive
        </a>
        <div className="article-meta-row">
          <div><strong>{article.author}</strong>Author</div>
          <div><strong>{article.verse}</strong>Scripture</div>
          <div><strong>{article.readTime}</strong>Read</div>
        </div>

        {article.body.map((block, i) => {
          if (block.type === 'lede') return <p key={i} className="lede">{block.text}</p>;
          if (block.type === 'p') return <p key={i}>{block.text}</p>;
          if (block.type === 'h') return <h2 key={i}>{block.text}</h2>;
          if (block.type === 'pullquote') return <div key={i} className="pullquote">"{block.text}"</div>;
          return null;
        })}

        {article.raw && (
          <div className="article-to-raw">
            <a href={`#/raw/${article.id}`} onClick={(e) => { e.preventDefault(); navigate('/raw/' + article.id); }}>
              ↳ Read the raw notes from this week
            </a>
          </div>
        )}
      </article>

      {nextArticle ? (
        <div className="next-article">
          <div className="label">↓ Next Entry — {nextArticle.number} / {nextArticle.category}</div>
          <div className="title" {...clickable(() => navigate('/article/' + nextArticle.id), `Read ${nextArticle.title}`)}>
            {nextArticle.title}
          </div>
        </div>
      ) : (
        <div className="next-article">
          <div className="label">↓ Next Up — Our Oath</div>
          <div className="title" {...clickable(() => navigate('/promise'), 'Read Our Oath')}>
            We Use AI.
          </div>
        </div>
      )}
    </div>);

}

// === Raw index — grid of weeks that have raw notes ===
function RawIndex() {
  const articles = window.ABIDE_ARTICLES;
  const rawEntries = articles.filter((a) => a.raw && a.raw.trim().length > 0);

  return (
    <div className="raw-index fade-in">
      <section className="raw-index-header">
        <span className="kicker">The Longer Read</span>
        <h1>Raw<span className="raw-dot">.</span></h1>
        <div className="raw-index-sub">
          Reflections is the week at a glance — a study guide, themed and tight. Raw is for when you want to <em>sit in the room</em>. Same meeting, untouched. Questions stay open. <RawInfoButton />
        </div>
      </section>

      {rawEntries.length === 0 ? (
        <div className="raw-empty">No raw notes yet. Check back after the next gathering.</div>
      ) : (
        <div className="articles raw-grid">
          {rawEntries.map((a) => (
            <div
              key={a.id}
              className="article-card raw-card"
              {...clickable(() => navigate('/raw/' + a.id), `Read raw notes for ${a.title}`)}
            >
              <div className="card-image raw-card-image">
                <span className="raw-card-mark">RAW</span>
              </div>
              <div className="card-body">
                <div className="pills">
                  <span className="pill">{a.date}</span>
                  <span className="pill">{calcReadTime(a.raw)} read</span>
                </div>
                <div className="card-title">{a.title}</div>
                <div className="card-excerpt">The room for Week {parseInt(a.number, 10)} — raw notes, unpolished, in the order things were said.</div>
                <div className="tags">
                  <span className="tag">raw notes</span>
                  <span className="tag">wk {parseInt(a.number, 10)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// === Raw page — single week's raw notes ===
function RawPage({ id }) {
  const articles = window.ABIDE_ARTICLES;
  const article = articles.find((a) => a.id === id);

  if (!article || !article.raw) {
    return (
      <div style={{ padding: 120, textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 80 }}>No Notes</h1>
        <a href="#/raw" onClick={(e) => {e.preventDefault();navigate('/raw');}} style={{ color: 'var(--accent)' }}>← Back to Raw</a>
      </div>
    );
  }

  const blocks = rawBlocks(article.raw);
  const firstParaIdx = blocks.findIndex((b) => b.type === 'p');
  const readTime = calcReadTime(article.raw);

  return (
    <div className="raw-page fade-in">
      <section className="raw-hero">
        <div className="raw-hero-inner">
          <div className="kicker">
            <span>Week {parseInt(article.number, 10)}</span>
            <span>{article.date}</span>
            <span>{readTime} read</span>
            <span>Entry {article.number}</span>
            <RawInfoButton />
          </div>
          <h1 className="raw-hero-title">Raw<span className="raw-dot">.</span></h1>
        </div>
      </section>

      <article className="article-body raw-body">
        <a className="back-link" href="#/raw" onClick={(e) => { e.preventDefault(); navigate('/raw'); }}>
          ← Back to Raw
        </a>
        <div className="article-meta-row">
          <div><strong>Week {parseInt(article.number, 10)}</strong>Gathering</div>
          <div><strong>{article.date}</strong>Date</div>
          <div><strong>{readTime}</strong>Read</div>
        </div>

        {blocks.map((b, i) => {
          if (b.type === 'break') return <div key={i} className="raw-ornament">✦</div>;
          if (b.type === 'h') return <h2 key={i} className="raw-h">{b.text}<span className="raw-h-dot">.</span></h2>;
          if (i === firstParaIdx) return <p key={i} className="raw-lede">{renderRawInline(b.text)}</p>;
          return <p key={i}>{renderRawInline(b.text)}</p>;
        })}

        <div className="raw-footer-link">
          <a href={`#/article/${article.id}`} onClick={(e) => { e.preventDefault(); navigate('/article/' + article.id); }}>
            Read the study guide for this week →
          </a>
        </div>
      </article>
    </div>
  );
}

// === Books Page ===
function BooksPage() {
  return (
    <div className="fade-in books-page">
      {/* Hero — Keller book */}
      <section className="book-hero">
        <div className="book-hero-text">
          <div className="kicker">
            <span className="cat">What we're reading</span>
            <span>·</span>
            <span>Spring 2026</span>
          </div>
          <h1 className="book-hero-title">Jesus<br />the King<span className="dot">.</span></h1>
          <div className="book-hero-tag">
            <em>"An extended meditation on the premise that Jesus' life, death, and resurrection form the central event of history."</em>
          </div>
          <div className="book-hero-meta">
            By <strong>Timothy Keller</strong>. Previously published as <em>King's Cross</em>.
          </div>
          <a className="book-cta" href="https://www.amazon.com/dp/1594486662" target="_blank" rel="noopener noreferrer">
            Order on Amazon →
          </a>
        </div>
        <div className="book-hero-image">
          <img src="./uploads/jesus-the-king.png?v=58" alt="Jesus the King by Timothy Keller" className="book-float" />
        </div>
      </section>

      {/* What people are saying */}
      <section className="book-reviews">
        <div className="kicker"><span className="cat">What people are saying</span></div>
        <div className="reviews-grid">
          <blockquote className="review">
            <p>"This is the book where Tim Keller hits his stride as an author... Keller directs readers' gaze toward the cross and will not allow them to look away."</p>
            <cite>Collin Hansen · The Gospel Coalition</cite>
          </blockquote>
          <blockquote className="review">
            <p>"An extended meditation on the premise that Jesus' life, death, and resurrection form the central event of history as well as the central organizing principle of our lives. Keller follows through the Gospel of Mark in a very readable commentary."</p>
            <cite>ChristianBook Reviewer</cite>
          </blockquote>
          <blockquote className="review">
            <p>"Excellent writing, inspiring insights, and a fresh look at the life of Christ through the lens of his death. I was crying in one chapter and then laughing in the next."</p>
            <cite>Luminous Libro</cite>
          </blockquote>
        </div>
      </section>

      {/* Inside the Keller book */}
      <section className="study-guide-inside reverse">
        <div className="inside-image">
          <img src="./uploads/jesus-the-king-flat.png?v=59" alt="Jesus the King — front, spine, and back" />
        </div>
        <div className="inside-text">
          <div className="kicker"><span className="cat">Inside the book</span></div>
          <h2>A journey through the Gospel of Mark.</h2>
          <ul className="inside-list">
            <li>Why Jesus came, what he taught, and why he died</li>
            <li>16 chapters — accessible, conversational, deeply biblical</li>
            <li>Originally published as <em>King's Cross</em></li>
          </ul>
        </div>
      </section>

      {/* Divider */}
      <div className="book-divider"><span>✦</span></div>

      {/* Study Guide */}
      <section className="book-hero study-guide-hero reverse">
        <div className="book-hero-image">
          <img src="./uploads/study-guide.png?v=58" alt="Jesus the King Study Guide" className="book-float" />
        </div>
        <div className="book-hero-text">
          <div className="kicker">
            <span className="cat">Companion study guide</span>
            <span>·</span>
            <span>Nine sessions</span>
          </div>
          <h1 className="book-hero-title">The Study<br />Guide<span className="dot">.</span></h1>
          <div className="book-hero-tag">
            <em>Scripture passages, reflection questions, discussion prompts. For going deeper, week by week.</em>
          </div>
          <div className="book-hero-meta">
            By <strong>Timothy Keller</strong> &amp; <strong>Spence Shelton</strong>.
          </div>
          <a className="book-cta" href="https://www.amazon.com/dp/0310814448" target="_blank" rel="noopener noreferrer">
            Order the study guide →
          </a>
        </div>
      </section>

      {/* What's inside */}
      <section className="study-guide-inside">
        <div className="inside-text">
          <div className="kicker"><span className="cat">What's inside</span></div>
          <h2>Nine sessions to walk through together.</h2>
          <ul className="inside-list">
            <li>Key scripture passages from each week</li>
            <li>Insightful questions for personal reflection</li>
            <li>Group discussion prompts</li>
            <li>Practical application for daily life</li>
          </ul>
        </div>
        <div className="inside-image">
          <img src="./uploads/study-guide-flat.png?v=58" alt="Study guide front, spine, and back" />
        </div>
      </section>

      <section className="books-back">
        <a className="back-link" href="#/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>← Back home</a>
      </section>
    </div>);

}

// === App ===
function App() {
  const route = useRoute();
  let page;
  if (route.startsWith('/article/')) {
    const id = route.slice('/article/'.length);
    page = <Article id={id} />;
  } else if (route === '/raw') {
    page = <RawIndex />;
  } else if (route.startsWith('/raw/')) {
    const id = route.slice('/raw/'.length);
    page = <RawPage id={id} />;
  } else if (route === '/promise') {
    page = <PromisePage />;
  } else if (route === '/books') {
    page = <BooksPage />;
  } else {
    page = <Home />;
  }
  return (
    <>
      <div className="noise"></div>
      <Nav />
      {page}
    </>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);