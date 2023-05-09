import type { NextApiRequest, NextApiResponse } from "next";
import satori from "satori";
import dayjs from "dayjs";
import BigNumber from "bignumber.js";

import { languageFontMap } from "../../utils/font";

const loadFont = async (host: string) => {
  return fetch(`${host}/Roboto-Regular.ttf`).then((res) => res.arrayBuffer());
};

const getMeta = async (name: string) => {
  return fetch(
    `https://indexer.crossbell.io/v1/handles/${name}/character`
  ).then((res) => res.json());
};

const getViewCount = async (characterId: string) => {
  return fetch(
    `https://indexer.crossbell.io/v1/stat/characters/${characterId}`
  ).then((res) => res.json());
};

const getArticleCount = async (characterId: string) => {
  return fetch(
    `https://indexer.crossbell.io/v1/notes?characterId=${characterId}&sources=xlog&tags=post&limit=0`
  ).then((res) => res.json());
};

const getFollowerCount = async (characterId: string) => {
  return fetch(
    `https://indexer.crossbell.io/v1/characters/${characterId}/backlinks?limit=0`
  ).then((res) => res.json());
};

const getCommentsCount = async (characterId: string) => {
  return fetch(
    `https://indexer.crossbell.io/v1/notes?limit=0&toCharacterId=${characterId}`
  ).then((res) => res.json());
};

const getReward = async (characterId: string) => {
  const { list } = await fetch(
    `https://indexer.crossbell.io/v1/tips?toCharacterId=${characterId}&tokenAddress=0xAfB95CC0BD320648B3E8Df6223d9CDD05EbeDC64&limit=1000`
  ).then((res) => res.json());

  const total = (list as { amount: string }[]).reduce((pre, next) => {
    return (
      pre +
      new BigNumber(next.amount)
        .div(BigInt("1000000000000000000").toString())
        .toNumber()
    );
  }, 0);

  return total;
};

const View: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style = {} }) => {
  return <div style={{ display: "flex", ...style }}>{children}</div>;
};

function withCache(fn: Function) {
  const cache = new Map();
  return async (...args: string[]) => {
    const key = args.join(":");
    if (cache.has(key)) return cache.get(key);
    const result = await fn(...args);
    cache.set(key, result);
    return result;
  };
}

const loadDynamicAsset = withCache(
  async (host: string, _code: string, text: string) => {
    const codes = _code.split("|");
    const names = codes
      .map((code) => languageFontMap[code as keyof typeof languageFontMap])
      .filter(Boolean);

    if (names.length === 0) return [];

    const params = new URLSearchParams();
    for (const name of names.flat()) {
      params.append("fonts", name);
    }
    params.set("text", text);

    try {
      const response = await fetch(`${host}/api/font?${params.toString()}`);

      if (response.status === 200) {
        const data = await response.arrayBuffer();
        const fonts: any[] = [];

        // Decode the encoded font format.
        const decodeFontInfoFromArrayBuffer = (buffer: ArrayBuffer) => {
          let offset = 0;
          const bufferView = new Uint8Array(buffer);

          while (offset < bufferView.length) {
            // 1 byte for font name length.
            const languageCodeLength = bufferView[offset];
            offset += 1;
            let languageCode = "";
            for (let i = 0; i < languageCodeLength; i++) {
              languageCode += String.fromCharCode(bufferView[offset + i]);
            }
            offset += languageCodeLength;

            // 4 bytes for font data length.
            const fontDataLength = new DataView(buffer).getUint32(
              offset,
              false
            );
            offset += 4;
            const fontData = buffer.slice(offset, offset + fontDataLength);
            offset += fontDataLength;

            fonts.push({
              name: `satori_${languageCode}_fallback_${text}`,
              data: fontData,
              weight: 400,
              style: "normal",
              lang: languageCode === "unknown" ? undefined : languageCode,
            });
          }
        };

        decodeFontInfoFromArrayBuffer(data);

        return fonts;
      }
    } catch (e) {
      console.error("Failed to load dynamic font for", text, ". Error:", e);
    }
  }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name, theme, layout } = req.query as {
    name: string;
    theme: string;
    layout: string;
  };

  const metaData = await getMeta(name);
  if (!metaData || !metaData.characterId) {
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.status(200).send("");
    return;
  }

  const { characterId } = metaData;

  const cards = [
    {
      id: "article",
      title: "发布的文章",
      value: 0,
      getData: async function () {
        const data = await getArticleCount(characterId);
        return data.count;
      },
    },
    {
      id: "comment",
      title: "收到的评论",
      value: 0,
      getData: async function () {
        const { count } = await getCommentsCount(characterId);
        return count;
      },
    },
    {
      id: "reward",
      title: "收到的打赏",
      value: 0,
      getData: async function () {
        return getReward(characterId);
      },
    },
    {
      id: "follower",
      title: "关注者",
      value: 0,
      getData: async function () {
        const { count } = await getFollowerCount(characterId);
        return count;
      },
    },
    {
      id: "viewCount",
      title: "浏览量",
      value: 0,
      getData: async function () {
        const { viewNoteCount } = await getViewCount(characterId);
        return viewNoteCount;
      },
    },
    {
      id: "site",
      title: "站点运行时间",
      value: "0",
      getData: async function () {
        const day = dayjs(new Date()).diff(dayjs(metaData.createdAt), "day");
        return day;
      },
    },
  ];

  let showCards: (typeof cards)[number][] = [];

  if (!layout) {
    showCards = [...cards];
  } else {
    layout.split("-").forEach((id) => {
      const card = cards.find((card) => card.id === id);
      if (card) {
        showCards.push(card);
      }
    });
  }

  for (const item of showCards) {
    item.value = await item.getData();
  }

  const host = `${req.headers["x-forwarded-proto"]}://${req.headers.host}`;
  const font = await loadFont(host);

  const svg = await satori(
    <View
      style={{ width: "100%", height: "100%", flexWrap: "wrap", padding: 10 }}
    >
      {showCards.map((card) => {
        return (
          <View
            style={{
              width: "33.33%",
              flexWrap: "wrap",
              padding: 10,
            }}
            key={card.id}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                backgroundColor:
                  theme === "light" ? "rgb(241, 245, 249)" : "rgb(15,23,42)",
                flexWrap: "wrap",
                borderRadius: "0.5rem",
                padding: 10,
              }}
            >
              <View
                style={{
                  width: "100%",
                  fontSize: "16px",
                  color:
                    theme === "light"
                      ? "rgb(39, 39, 42)"
                      : "rgb(228, 228, 231)",
                }}
              >
                {card.title}
              </View>
              <View
                style={{
                  width: "100%",
                  fontSize: "24px",
                  fontWeight: "bold",
                  color:
                    theme === "light"
                      ? "rgb(39, 39, 42)"
                      : "rgb(228, 228, 231)",
                }}
              >
                {card.value}
              </View>
            </View>
          </View>
        );
      })}
    </View>,
    {
      width: 700,
      height: 200,
      embedFont: true,
      loadAdditionalAsset(languageCode: string, segment: string) {
        return loadDynamicAsset(host, languageCode, segment);
      },
      fonts: [
        {
          name: "Roboto",
          data: font,
          weight: 400,
          style: "normal",
          lang: "zh-CN",
        },
      ],
    }
  );

  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.status(200).send(svg);
}
