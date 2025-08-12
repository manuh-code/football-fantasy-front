import { UserDataInterface } from "@/interfaces/user/userInterface";
import { UserPayload } from "@/interfaces/user/userPayload";
import userService from "@/services/user/UserService";
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
    state: () => {
        return { userData: null as UserDataInterface | null };

    },
    getters: {
        getUserData(): UserDataInterface | null {
            return this.userData;
        },
        getAvatarUrl(): string | null {
            return this.userData?.avatar || null;
        }
    },
    actions: {
        setUserData(userData: UserDataInterface | null): void {
            this.userData = userData;
        },
        async setUserDataFromApi(): Promise<void> {
            const response = await userService.getUserData();
            this.setUserData(response);
        },
        async updateProfile(payload: UserPayload): Promise<void> {
            const response = await userService.updateProfile(payload);
            this.setUserData(response);
        },
        async changeAvatar(file: File): Promise<void> {
            const response = await userService.changeAvatar(file);
            this.setUserData(response);
        }
    },
    persist: {
        storage: sessionStorage,
        pick: ['userData'], // Only persist the userData property
    },
});