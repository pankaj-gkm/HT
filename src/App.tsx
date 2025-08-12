// @ts-expect-error no declaration file
import CryptoJS from "crypto-js";
import { valid } from "uuid4";

import { useState } from "react";
import "./App.css";

const getEncryptedToken = (token: string) => {
  const key = CryptoJS.enc.Utf8.parse("aKpQzRtd"); // salt should be taken from env
  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(token?.toString()),
    key,
    {
      keySize: 128 / 8,
      iv: key,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );
  return encrypted?.toString();
};

function App() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("0c63ca33-9ff9-4b5e-8f6e-0abbd4b4fe1d");
  const [sessionToken, setSessionToken] = useState();

  const [showHeader, setShowHeader] = useState(false);
  const [continueCtaTitle, setContinueCtaTitle] =
    useState<string>("Continue Reading");

  const [continueCtaRedirectionUrl, setContinueCtaRedirectionUrl] =
    useState<string>("https://www.hindustantimes.com/sports");

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
      .then((data) => setSessionToken(getEncryptedToken(data.token)))
      .catch((error) => console.error("Error:", error));
  };

  const isValidUserId = valid(userId);

  // const baseUrl = "http://localhost:3001/voucher/book-my-show";
  const baseUrl = "https://stage.kstore.global/voucher/book-my-show";
  const storeIdentifier = "ht-kstore-india";

  function highlightSearchParams(url: string): string {
    try {
      const params = {
        showHeader,
        storeIdentifier: encodeURIComponent(storeIdentifier),
        continueCtaTitle: continueCtaTitle
          ? encodeURIComponent(continueCtaTitle)
          : undefined,
        continueCtaRedirectionUrl: continueCtaRedirectionUrl
          ? encodeURIComponent(continueCtaRedirectionUrl)
          : undefined,
        sessionToken: sessionToken
          ? encodeURIComponent(sessionToken)
          : undefined,
      };

      const highlightedParams = Object.entries(params)
        .filter(([, value]) => typeof value !== "undefined")
        .map(
          ([key, value]) =>
            `<span style="color: #F0E68C; font-weight: bold;">${key}</span>=${value}`
        )
        .join("&");

      return `<span style="color: #FFA07A; font-weight: bold;">${baseUrl}</span>?${highlightedParams}`;
    } catch {
      return url; // return original if parsing fails
    }
  }

  function getRedirectUrl(): string {
    const params: Record<string, string | boolean | undefined> = {
      showHeader,
      storeIdentifier: encodeURIComponent(storeIdentifier),
      continueCtaTitle: continueCtaTitle
        ? encodeURIComponent(continueCtaTitle)
        : undefined,
      continueCtaRedirectionUrl: continueCtaRedirectionUrl
        ? encodeURIComponent(continueCtaRedirectionUrl)
        : undefined,
      sessionToken: sessionToken ? encodeURIComponent(sessionToken) : undefined,
    };

    const query = Object.entries(params)
      .filter(([, value]) => typeof value !== "undefined")
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    return `${baseUrl}?${query}`;
  }

  if (open) {
    return (
      <iframe
        src={getRedirectUrl()}
        style={{ width: "100vw", height: "100vh", border: "none" }}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 16,
        width: 620,
      }}
    >
      <div>
        <input
          onChange={(e) => {
            setUserId(e.currentTarget.value);
            setSessionToken(undefined);
          }}
          value={userId}
          style={{
            width: 414,
            height: 52,
            marginRight: 16,
            padding: 0,
            paddingLeft: 10,
            outlineColor: isValidUserId ? "white" : "red",
          }}
        />
        <button onClick={() => getUrl()} style={{ height: 56, width: 160 }}>
          Create Session
        </button>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 12,
          width: "100%",
        }}
      >
        <div style={groupStyle}>
          <label style={labelStyle}>Continue CTA Title</label>
          <input
            type="text"
            value={continueCtaTitle}
            onChange={(e) => setContinueCtaTitle(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ ...groupStyle, flex: 2 }}>
          <label style={labelStyle}>Continue CTA Redirection URL</label>
          <input
            type="text"
            value={continueCtaRedirectionUrl}
            onChange={(e) => setContinueCtaRedirectionUrl(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={groupStyle}>
        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            checked={showHeader}
            onChange={(e) => setShowHeader(e.target.checked)}
          />
          Show Header
        </label>
      </div>

      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <label>Redirect URI</label>
      </div>

      <div
        dangerouslySetInnerHTML={{
          __html: highlightSearchParams(sessionToken || ""),
        }}
        style={{
          width: "150%",
          transform: "translateX(-16.67%)",
          padding: 10,
          fontSize: 16,
          justifyContent: "flex-start",
          alignItems: "center",
          border: "1px solid #F0E68C",
          borderRadius: 8,
          display: "block", // Change from inline to block
          wordBreak: "break-all", // Break long strings like URLs
          whiteSpace: "pre-wrap",
          overflow: "scroll",
          height: 300,
        }}
      />
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <button
          disabled={
            !continueCtaRedirectionUrl ||
            !continueCtaTitle ||
            !continueCtaTitle ||
            !sessionToken ||
            !isValidUserId
          }
          onClick={() => setOpen(true)}
        >
          Redirect
        </button>
      </div>
    </div>
  );
}

export default App;

const groupStyle = {
  marginBottom: "16px",
  flex: 1,
  display: " flex",
  flexDirection: "column",
  justifyContent: "center",
} as const;

const labelStyle = {
  display: "block",
  fontSize: "14px",
  marginBottom: "6px",
};

const inputStyle = {
  padding: "8px",
  fontSize: "14px",
  border: "1px solid #ccc",
  borderRadius: "4px",
};

const checkboxLabelStyle = {
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};
