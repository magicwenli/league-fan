import { PropsContext } from "@/data/propsContext";
import { prepareCollection, SkinWithMeta } from "@/components/skin-viewer/helpers";
import { getChampionById, getChampionByName, getSkinlineById, getSkinsOfChampionById, getSkinsOfSkinline, splitId } from "@/data/helpers";
import { Skin, Skinline } from "@/types";
import { createContext, ReactNode, useContext } from "react";
import { get } from "http";

interface SkinContextType {
    name: string;
    skin: SkinWithMeta | null;
    prev: SkinWithMeta | null;
    next: SkinWithMeta | null;
    patch: string;
}

const value: SkinContextType = {
    name: "",
    skin: null,
    prev: null,
    next: null,
    patch: "",
}

const SkinContext = createContext<SkinContextType>(value);
SkinContext.displayName = "SkinContext";

function SkinProvider({
    children, value
}: {
    children: ReactNode,
    value: {
        skin: Skin;
        type?: 'champion' | 'skinline',
        id?: string;
    }
}) {
    const { skins, champions, skinlines, patch } = useContext(PropsContext);
    const type = value.type ?? 'champion'
    let id = value.id;
    if (!id) {
        if (type === 'champion') {
            const defaultChamp = getChampionById(splitId(value.skin.id)[0], champions)
            id = defaultChamp?.alias.toString()
        } else {
            const defaultSkinline = value.skin.skinLines;
            id = defaultSkinline?.[0].id.toString()
        }
    }
    if (!id) {
        throw new Error('Id is missing')
    }
    let skinsSet: Skin[] = [];
    let name = '';
    let currIdx = 0;

    if (type === 'skinline') {
        const skinline = getSkinlineById(Number(id), skinlines) ?? skinlines[0];
        skinsSet = getSkinsOfSkinline(skinline.id, skins, champions)
        name = skinline.name;
    } else {
        const champ = getChampionByName(id, champions) ?? champions[0];
        skinsSet = getSkinsOfChampionById(champ.id, skins)
        name = champ.name;
    }

    currIdx = skinsSet.findIndex(skin => skin.id === value.skin.id)
    const { skin, prev, next } = prepareCollection(currIdx, skinsSet)
    const props: SkinContextType = {
        name,
        skin,
        prev,
        next,
        patch,
    }
    return <SkinContext.Provider value={props} > {children} </SkinContext.Provider>
}

export { SkinContext, SkinProvider }