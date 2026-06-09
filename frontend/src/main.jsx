import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL = "http://127.0.0.1:8000/api";
const emptyCat = {
  name: "",
  color: "#c8ff3b",
  birth_year: new Date().getFullYear(),
  achievementsText: "",
  image: null,
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("kittygramToken") || "");
  const [mode, setMode] = useState(token ? "cats" : "login");
  const [authForm, setAuthForm] = useState({ username: "", password: "", re_password: "" });
  const [cats, setCats] = useState([]);
  const [catForm, setCatForm] = useState(emptyCat);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const authHeaders = useMemo(
    () => (token ? { Authorization: `Token ${token}` } : {}),
    [token],
  );

  useEffect(() => {
    if (token) {
      loadCats();
    }
  }, [token]);

  async function request(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...authHeaders,
        ...(options.headers || {}),
      },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      const errorText = typeof data === "string" ? data : JSON.stringify(data, null, 2);
      throw new Error(errorText || `Ошибка ${response.status}`);
    }
    return data;
  }

  async function register(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await request("/users/", {
        method: "POST",
        body: JSON.stringify({
          username: authForm.username,
          password: authForm.password,
          re_password: authForm.re_password,
        }),
      });
      setMessage("Регистрация готова. Теперь войдите в аккаунт.");
      setMode("login");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function login(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const data = await request("/token/login/", {
        method: "POST",
        body: JSON.stringify({
          username: authForm.username,
          password: authForm.password,
        }),
      });
      localStorage.setItem("kittygramToken", data.auth_token);
      setToken(data.auth_token);
      setMode("cats");
      setAuthForm({ username: "", password: "", re_password: "" });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await request("/token/logout/", { method: "POST" });
    } catch {
      // Local logout should still clear a stale token.
    }
    localStorage.removeItem("kittygramToken");
    setToken("");
    setCats([]);
    setMode("login");
  }

  async function loadCats() {
    setLoading(true);
    try {
      const data = await request("/cats/");
      setCats(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function resetCatForm() {
    setCatForm(emptyCat);
    setEditingId(null);
  }

  function editCat(cat) {
    setEditingId(cat.id);
    setCatForm({
      name: cat.name,
      color: cat.color,
      birth_year: cat.birth_year,
      achievementsText: cat.achievements.map((item) => item.name).join(", "),
      image: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveCat(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const achievements = catForm.achievementsText
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => ({ name }));
      const image = await fileToBase64(catForm.image);
      const payload = {
        name: catForm.name,
        color: catForm.color,
        birth_year: Number(catForm.birth_year),
        achievements,
      };
      if (image) {
        payload.image = image;
      }
      await request(editingId ? `/cats/${editingId}/` : "/cats/", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      resetCatForm();
      await loadCats();
      setMessage(editingId ? "Котик обновлен." : "Котик добавлен.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCat(id) {
    setLoading(true);
    setMessage("");
    try {
      await request(`/cats/${id}/`, { method: "DELETE" });
      await loadCats();
      setMessage("Котик удален.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <header className="header">
        <div>
          <h1>Kittygram</h1>
          <p>Личный каталог котиков и их достижений</p>
        </div>
        <nav>
          {!token && (
            <>
              <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
                Вход
              </button>
              <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
                Регистрация
              </button>
            </>
          )}
          {token && <button onClick={logout}>Выйти</button>}
        </nav>
      </header>

      {message && <pre className="message">{message}</pre>}

      {!token && (
        <section className="panel auth-panel">
          <h2>{mode === "register" ? "Регистрация" : "Вход"}</h2>
          <form onSubmit={mode === "register" ? register : login}>
            <label>
              Логин
              <input
                value={authForm.username}
                onChange={(event) => setAuthForm({ ...authForm, username: event.target.value })}
                required
              />
            </label>
            <label>
              Пароль
              <input
                type="password"
                value={authForm.password}
                onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                required
              />
            </label>
            {mode === "register" && (
              <label>
                Повторите пароль
                <input
                  type="password"
                  value={authForm.re_password}
                  onChange={(event) => setAuthForm({ ...authForm, re_password: event.target.value })}
                  required
                />
              </label>
            )}
            <button type="submit" disabled={loading}>
              {mode === "register" ? "Создать аккаунт" : "Войти"}
            </button>
          </form>
        </section>
      )}

      {token && (
        <>
          <section className="panel">
            <h2>{editingId ? "Редактировать котика" : "Добавить котика"}</h2>
            <form className="cat-form" onSubmit={saveCat}>
              <label>
                Имя
                <input
                  maxLength="16"
                  value={catForm.name}
                  onChange={(event) => setCatForm({ ...catForm, name: event.target.value })}
                  required
                />
              </label>
              <label>
                Цвет
                <input
                  type="color"
                  value={catForm.color}
                  onChange={(event) => setCatForm({ ...catForm, color: event.target.value })}
                />
              </label>
              <label>
                Год рождения
                <input
                  type="number"
                  value={catForm.birth_year}
                  onChange={(event) => setCatForm({ ...catForm, birth_year: event.target.value })}
                  required
                />
              </label>
              <label>
                Достижения через запятую
                <input
                  value={catForm.achievementsText}
                  onChange={(event) => setCatForm({ ...catForm, achievementsText: event.target.value })}
                />
              </label>
              <label>
                Фото
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setCatForm({ ...catForm, image: event.target.files[0] })}
                />
              </label>
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {editingId ? "Сохранить" : "Добавить"}
                </button>
                {editingId && (
                  <button type="button" className="secondary" onClick={resetCatForm}>
                    Отменить
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="cats-section">
            <div className="section-title">
              <h2>Мои котики</h2>
              <button className="secondary" onClick={loadCats} disabled={loading}>
                Обновить
              </button>
            </div>
            {cats.length === 0 && <p className="empty">Котиков пока нет.</p>}
            <div className="cat-grid">
              {cats.map((cat) => (
                <article className="cat-card" key={cat.id}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} />
                  ) : (
                    <div className="cat-placeholder" style={{ backgroundColor: cat.color }}>
                      {cat.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="cat-info">
                    <h3>{cat.name}</h3>
                    <p>
                      <span className="swatch" style={{ backgroundColor: cat.color }} />
                      {cat.color}
                    </p>
                    <p>Год рождения: {cat.birth_year}</p>
                    <p>Возраст: {cat.age}</p>
                    <ul>
                      {cat.achievements.map((achievement) => (
                        <li key={achievement.id || achievement.name}>{achievement.name}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="card-actions">
                    <button className="secondary" onClick={() => editCat(cat)}>
                      Редактировать
                    </button>
                    <button className="danger" onClick={() => deleteCat(cat.id)}>
                      Удалить
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
