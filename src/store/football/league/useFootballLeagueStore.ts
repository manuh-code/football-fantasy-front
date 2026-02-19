import { FootballLeagueResponse } from '@/interfaces/football/league/FootballLeagueResponse'
import { FootballSeasonResponse } from '@/interfaces/football/season/FootballSeasonResponse';
import { defineStore } from 'pinia'

export const useFootballLeagueStore = defineStore("footballLeague", {

    state: () => ({
        league: null as FootballLeagueResponse | null
    }),

    actions: {
        setLeague(data: FootballLeagueResponse) {
            this.league = data
        },
        existLeague(): boolean {
            return this.league !== null
        },
        clearLeague() {
            this.league = null
        },
        getFootballLeagueUuid(): string | null {
            return this.league?.uuid || null
        },
        getCurrentFootballSeason(): FootballSeasonResponse | null {
            return this.league?.current_season || null
        }
    },
    getters: {
        getLeague: (state) => state.league
    },
    persist: {
        storage: localStorage
    }

});