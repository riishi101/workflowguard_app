import { Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(payload: {
        sub: string;
        email: string;
    }): Promise<{
        email: string;
        name: string | null;
        password: string | null;
        jobTitle: string | null;
        timezone: string | null;
        language: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hubspotPortalId: string | null;
        hubspotAccessToken: string | null;
        hubspotRefreshToken: string | null;
        hubspotTokenExpiresAt: Date | null;
    } | null>;
}
export {};
