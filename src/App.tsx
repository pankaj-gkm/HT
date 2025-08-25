import uuid4 from "uuid4";
// @ts-expect-error no declaration file
import CryptoJS from "crypto-js";
import { useForm } from "react-hook-form";
import { useState, type PropsWithChildren } from "react";

import "./App.css";
import RefreshIcon from "./assets/refresh";
import { TextField } from "./components/TextField";
import { CheckboxField } from "./components/CheckboxField";

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

const Group = ({ children }: PropsWithChildren) => (
  <div
    style={{ display: "flex", flexDirection: "row", gap: 12, width: "100%" }}
  >
    {children}
  </div>
);

const isStaging = false;

const baseURl = isStaging
  ? "https://stage-platform-protocols.kgen.io"
  : "https://prod-platform-protocols.kgen.io";

const defaultVoucher = isStaging ? "book-my-show" : "zepto";

const defaultTokens = isStaging
  ? {
      "x-client-id": "209cbe38-abf2-4673-8c86-f1be4942eacc",
      "x-client-secret": "f3mm1OKppwdfd7Wtu2F8YMCwlOWOXH680kPmEzP02d",
    }
  : {
      "x-client-id": "",
      "x-client-secret": "",
    };

const storeUrl = isStaging
  ? "https://stage.kstore.global/"
  : "https://kstore.global";

function App() {
  const [open, setOpen] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | undefined>();

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      userId: "0c63ca33-9ff9-4b5e-8f6e-0abbd4b4fe1d",
      tokenId: defaultTokens["x-client-id"],
      tokenSecret: defaultTokens["x-client-secret"],
      storeIdentifier: "ht-kstore-india",
      voucher: defaultVoucher,
      showHeader: false,
      continueCtaTitle: "Continue Reading",
      continueCtaRedirectionUrl: "https://www.hindustantimes.com/sports",
      orderHistoryRedirectionUrl:
        "https://www.hindustantimes.com/order-history",
    },
  });

  const values = watch();
  const tokens = {
    "x-client-id": values.tokenId,
    "x-client-secret": values.tokenSecret,
  };
  const baseUrl = `${storeUrl}/voucher/${values.voucher}`;

  const params = {
    showHeader: values.showHeader,
    storeIdentifier: encodeURIComponent(values.storeIdentifier),
    continueCtaTitle: values.continueCtaTitle
      ? encodeURIComponent(values.continueCtaTitle)
      : undefined,
    continueCtaRedirectionUrl: values.continueCtaRedirectionUrl
      ? encodeURIComponent(values.continueCtaRedirectionUrl)
      : undefined,
    orderHistoryRedirectionUrl: values.orderHistoryRedirectionUrl
      ? encodeURIComponent(values.orderHistoryRedirectionUrl)
      : undefined,
    sessionToken: sessionToken ? encodeURIComponent(sessionToken) : undefined,
  };

  function highlightSearchParams(url: string): string {
    try {
      const highlightedParams = Object.entries(params)
        .filter(([, value]) => typeof value !== "undefined")
        .map(
          ([key, value]) =>
            `<span style="color: #F0E68C; font-weight: bold;">${key}</span>=${value}`
        )
        .join("&");
      return `<span style="color: #FFA07A; font-weight: bold;">${baseUrl}</span>?${highlightedParams}`;
    } catch {
      return url;
    }
  }

  function getRedirectUrl(): string {
    const query = Object.entries(params)
      .filter(([, value]) => typeof value !== "undefined")
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    return `${baseUrl}?${query}`;
  }

  const getUrl = (user?: string) => {
    fetch(`${baseURl}/s2s/session`, {
      method: "POST",
      headers: { ...tokens, "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user || values.userId }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("🚀 ~ getUrl ~ data:", data);
        return setSessionToken(getEncryptedToken(data.token));
      })
      .catch((error) => console.error("Error:", error));
  };

  const onSetUserId = () => {
    const user = uuid4();
    setValue("userId", user);
    setSessionToken(undefined);
    getUrl(user);
  };

  const disableCreateSession = !values.tokenSecret || !values.tokenId;

  if (open) {
    return (
      <iframe
        src={getRedirectUrl()}
        style={{ width: "100vw", height: "100vh", border: "none" }}
        sandbox="allow-forms allow-same-origin allow-scripts allow-popups allow-top-navigation allow-top-navigation-by-user-activation"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(() => setOpen(true))} style={formStyles}>
      <Group>
        <TextField
          name="userId"
          control={control}
          style={userIdField}
          containerStyle={{ marginBottom: 0 }}
        />
        <div style={{ display: "flex", flexDirection: "row", gap: 6 }}>
          <button
            type="button"
            onClick={onSetUserId}
            disabled={disableCreateSession}
            style={{ height: 56, width: 56, transform: "translateY(2px)" }}
          >
            <RefreshIcon />
          </button>
          <button
            type="button"
            disabled={disableCreateSession}
            onClick={() => {
              setSessionToken(undefined);
              getUrl();
            }}
            style={{ height: 56, width: 160, transform: "translateY(2px)" }}
          >
            Create Session
          </button>
        </div>
      </Group>
      <Group>
        <TextField
          name="continueCtaTitle"
          control={control}
          label="Continue CTA Title"
          style={groupStyle}
        />
        <TextField
          name="continueCtaRedirectionUrl"
          control={control}
          label="Continue CTA Redirection URL"
          style={groupStyle}
        />
        <TextField
          name="orderHistoryRedirectionUrl"
          control={control}
          label="Order History Redirection Url"
          style={groupStyle}
        />
      </Group>

      <Group>
        <CheckboxField
          name="showHeader"
          control={control}
          label="Show Header"
          style={{ ...groupStyle, flex: 0, minWidth: 200 }}
        />
        <TextField
          name="voucher"
          control={control}
          label="Voucher"
          style={{ ...groupStyle, flex: 2 }}
        />
      </Group>

      <Group>
        <TextField
          name="tokenId"
          control={control}
          label="Secret Token ID"
          style={{ ...groupStyle, flex: 2 }}
        />
        <TextField
          name="tokenSecret"
          control={control}
          label="Secret Token Secret"
          style={{ ...groupStyle, flex: 2 }}
        />
        <TextField
          name="storeIdentifier"
          control={control}
          label="StoreID"
          style={{ ...groupStyle, flex: 2 }}
        />
      </Group>

      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <label>Redirect URI</label>
      </div>
      <div
        dangerouslySetInnerHTML={{
          __html: highlightSearchParams(sessionToken || ""),
        }}
        style={redirectUriField}
      />

      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <button
          type="submit"
          disabled={
            !values.continueCtaRedirectionUrl ||
            !values.continueCtaTitle ||
            !sessionToken
          }
        >
          Redirect
        </button>
      </div>
    </form>
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

const redirectUriField = {
  padding: 10,
  fontSize: 16,
  justifyContent: "flex-start",
  alignItems: "center",
  border: "1px solid #F0E68C",
  borderRadius: 8,
  display: "block",
  wordBreak: "break-all",
  whiteSpace: "pre-wrap",
  overflow: "scroll",
  height: 300,
} as const;

const userIdField = {
  flex: 1,
  height: 52,
  marginRight: 16,
  padding: 0,
  paddingLeft: 10,
};

const formStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 16,
  padding: 100,
} as const;
