import { useState } from "react";
import "./App.css";

function App() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("0C63CA33-9FF9-4B5E-8F6E-0ABBD4B4FE1D");

  const getUrl = () => {
    fetch("https://stage-platform-protocols.kgen.io/s2s/session", {
      method: "POST",
      headers: {
        "x-client-id": "209cbe38-abf2-4673-8c86-f1be4942eacc",
        "x-client-secret": "f3mm1OKppwdfd7Wtu2F8YMCwlOWOXH680kPmEzP02d",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    })
      .then((response) => response.json())
      .then((data) => setOpen(data.token))
      .catch((error) => console.error("Error:", error));
  };

  return (
    <>
      {!open && (
        <>
          <input
            onChange={(e) => {
              setUserId(e.currentTarget.value);
            }}
            value={userId}
            style={{
              width: 400,
              height: 52,
              marginRight: 16,
              padding: 0,
              paddingLeft: 10,
            }}
          />
          <button onClick={() => getUrl()} style={{ height: 56 }}>
            redeem
          </button>
        </>
      )}

      {open && (
        <iframe
          src={`https://stage.kstore.global?sessionToken=${open}`}
          style={{ width: "100vw", height: "100vh", border: "none" }}
        />
      )}
    </>
  );
}

export default App;
