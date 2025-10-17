/// <reference types="vite/client" />
/// <reference types="react-router" />

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
        id: string;
        name: string;
        handle: string;
        email: string;
    }

    interface AuthContext {
        api: KyInstance;
        data: AuthData; // todo: rename to auth info
        setData: React.Dispatch<React.SetStateAction<AuthData>>;
    }

    interface GlobalStateContext {
        clubs: LoadedData<Tourney.MyClubMembership[]>;
        setClubs: React.Dispatch<React.SetStateAction<LoadedData<Tourney.MyClubMembership[]>>>;
    }

    interface ClubContext {
        club: LoadedResolved<Tourney.MyClub>;
        setClub: React.Dispatch<React.SetStateAction<LoadedResolved<Tourney.MyClub>>>;

        clubMembers: LoadedData<Tourney.ClubMember[]>;
        setClubMembers: React.Dispatch<React.SetStateAction<LoadedData<Tourney.ClubMember[]>>>;

        tournaments: LoadedData<Tourney.Tournament[]>;
        setTournaments: React.Dispatch<React.SetStateAction<LoadedData<Tourney.Tournament[]>>>;
    }

    interface TournamentContext {
        tournament: LoadedResolved<Tourney.Tournament>;
        setTournament: React.Dispatch<React.SetStateAction<LoadedResolved<Tourney.Tournament>>>;
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

    // app specific
    namespace Tourney {
        interface MongoObject {
            _id: string;
        }

        interface User extends MongoObject {
            name: string;
            handle: string;
            email: string;
        }

        type ClubMemberRole = "owner" | "admin" | "member";

        interface ClubMembership extends MongoObject {
            joined_at: string;
            role: ClubMemberRole;
        }

        interface MyClubMembership extends ClubMembership {
            club: Tourney.Club;
        }

        interface Club extends MongoObject {
            name: string;
            handle: string;
        }

        interface MyClub extends Club {
            membership: ClubMembership;
        }

        interface ClubMember extends ClubMembership {
            user: Tourney.User;
        }

        interface TournamentSettings {
            rankingConfig: {
                winPoints: number;
                drawPoints: number;
                lossPoints: number;
                addScorePoints: boolean;
            };
        }

        interface Tournament extends MongoObject {
            name: string;
            clubId: string;
            createdAt: string;
            startTime?: string;
            endTime?: string;
            settings: TournamentSettings;
        }
    }
}
