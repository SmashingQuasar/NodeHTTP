import type { BinaryLike, KeyObject } from "crypto";

type Token = [string, string, string];

type Secret = BinaryLike|KeyObject;

export type { Token, Secret };
