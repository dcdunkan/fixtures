/// <reference types="vite/client" />

import { KyInstance } from "ky";

interface ViteTypeOptions {
    // By adding this line, you can make the type of ImportMetaEnv strict
    // to disallow unknown keys.
    // strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
    readonly VITE_BACKEND_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

export {};

declare global {
    interface AuthData {
        name: string;
        email: string;
    }

    interface AuthContext {
        api: KyInstance;
        data: AuthData;
        setData: React.Dispatch<React.SetStateAction<AuthData>>;
    }

    type LoadedPending = {
        state: "pending";
        message: string;
    };
    type LoadedRejected = {
        state: "rejected";
        message: string;
    };
    type LoadedResolved<T> = {
        state: "resolved";
        data: T;
    };
    type LoadedData<T> =
        | LoadedPending
        | LoadedResolved<T>
        | LoadedRejected;

    namespace Tourney {
        interface MongoObject {
            _id: string;
        }

        interface Club extends MongoObject {
            name: string;
        }
    }
}
