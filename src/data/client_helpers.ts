
'use client'

import { useEffect, useState } from "react";
import { CDRAGON } from "./constants";
import { useRouter } from "next/navigation";
import { Added, Champion, Skin, Skins } from "@/types";
import { RarityEnum } from "@/types/skins";

export const raritiesMap: Partial<Record<RarityEnum, [string, string]>> = {
    [RarityEnum.KUltimate]: ["ultimate.png", "Ultimate"],
    [RarityEnum.KMythic]: ["mythic.png", "Mythic"],
    [RarityEnum.KLegendary]: ["legendary.png", "Legendary"],
    [RarityEnum.KEpic]: ["epic.png", "Epic"],
    [RarityEnum.KTranscendent]: ["transcendent.png", "Transcendent"],
};

export function getRarityOfSkin(skin: Skin) {
    if (!skin.rarity || !(skin.rarity in raritiesMap)) {
        return null;
    }
    const rarityInfo = raritiesMap[skin.rarity];
    if (!rarityInfo) {
        return null;
    }
    const [imgName, name] = rarityInfo;
    const imgUrl = `${dataRoot({})}/v1/rarity-gem-icons/${imgName}`;
    return {
        imgUrl,
        name,
    };
}

export function splitId(id: number) {
    return [Math.floor(id / 1000), id % 1000];
}

export function getAddedSkins(added: Added, skins: Skins, champions: Champion[]) {
    return added.skins
        .map((id) => {
            if (!skins[id]) {
                console.error("Missing skin", id);
                return null;
            }
            return skins[id];
        })
        .filter((skin): skin is Skin => skin !== null)
        .sort((a, b) => (a.name > b.name ? 1 : -1))
        .map((skin) => {
            if (!skin.id) {
                console.error("Missing skin id", skin);
            }
            const cId = splitId(skin.id)[0];
            const champ = champions.find((c) => c.id === cId) || { key: "" };
            return { ...skin, $$key: champ.key };
        });
}

export function getSkinsOfChampionById(id: number, skins: Skins) {
    return Object.values(skins).filter((skin) => splitId(skin.id)[0] === id);
}

export function getChampionByName(name: string, champions: Champion[]) {
    return champions.find((champ) => champ.alias.toLowerCase() === name.toLowerCase());
}

export function sortSkins(sortByRarity: boolean, skins: Skin[]) {
    if (sortByRarity) {
        const keys = Object.keys(raritiesMap).reverse();
        return skins
            .slice()
            .sort((a, b) => keys.indexOf(b.rarity) - keys.indexOf(a.rarity));
    }
    return skins;
}

export function useLocalStorageState(name: string, initialValue: any) {
    const [value, _setValue] = useState(initialValue);
    useEffect(() => {
        localStorage[name] && _setValue(JSON.parse(localStorage[name]));
    }, [name]);

    const setValue = (v: any) => {
        _setValue(v);
        localStorage[name] = JSON.stringify(v);
    };
    return [value, setValue];
}

export function dataRoot({ patch = "pbe", lang = 'default' }) {
    return `${CDRAGON}/${patch}/plugins/rcp-be-lol-game-data/global/${lang}`;
}

interface AssetOptions {
    patch?: string;
    lang?: string;
}

export function asset(path: string, { patch = "pbe", lang = 'default' }: AssetOptions = {}) {
    return path.replace("/lol-game-data/assets", dataRoot({ patch, lang })).toLowerCase();
}

function isTextBox(element: Element | null) {
    if (!element) return false;
    var tagName = element.tagName.toLowerCase();
    if (tagName === "textarea") return true;
    if (tagName !== "input") return false;
    var type = element.getAttribute("type")?.toLowerCase() || "",
        // if any of these input types is not supported by a browser, it will behave as input type text.
        inputTypes = [
            "text",
            "password",
            "number",
            "email",
            "tel",
            "url",
            "search",
            "date",
            "datetime",
            "datetime-local",
            "time",
            "month",
            "week",
        ];
    return inputTypes.indexOf(type) >= 0;
}

export function useEscapeTo(url: string) {
    const router = useRouter();
    useEffect(() => {
        function onKeyDown(e: { code: string; preventDefault: () => void; }) {
            if (isTextBox(document.activeElement)) return; // Ignore events when an input is active.
            if (e.code === "Escape") {
                router.push(url);
                e.preventDefault();
            }
        }

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [router, url]);
}
