import { atom } from "jotai";
import { WidgetScreen } from "@/modules/widgets/types";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { CONTACT_SESSION_KEY } from "../constants";
import { Id } from "@workspace/backend/_generated/dataModel";

export const screenAtom = atom<WidgetScreen>("loading");
export const organizationIdAtom = atom<string | null>(null);
export const contactSessionIdAtomFamily = atomFamily((organizationId:string) => {
    return atomWithStorage<Id<"contactSession"> | null>(`${CONTACT_SESSION_KEY}_${organizationId}`,null)
})

export const errorMessageAtom = atom<string | null>(null);
export const loadingMessageAtom = atom<string | null>(null);