package com.window.global.security.jwt;

import com.window.domain.member.entity.Member;
import com.window.global.config.JwtValueConfig;
import com.window.global.security.auth.PrincipalDetails;
import com.window.global.security.auth.PrincipalDetailsService;
import io.jsonwebtoken.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtTokenProvider {

    private final JwtValueConfig config;
    private final PrincipalDetailsService principalDetailsService;

    public String generateAccessToken(Member member) {
        return Jwts.builder()
                .claim("id", member.getId())
                .claim("email", member.getEmail())
                .issuedAt(expireDate(config.getAccessExpirationTime()))
                .signWith(config.getSecretKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(Member member) {
        return Jwts.builder()
                .claim("id", member.getId())
                .claim("email", member.getEmail())
                .issuedAt(expireDate(config.getRefreshExpirationTime()))
                .signWith(config.getSecretKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Date expireDate(long expireTime) {
        return new Date(new Date().getTime() + expireTime);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(config.getSecretKey())
                    .build()
                    .parseSignedClaims(token);
            return  true;
        } catch (JwtException e) {
            return false;
        }
    }

    public String getEmail(String token) {
        return Jwts.parser()
                .verifyWith(config.getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("email", String.class);
    }

    public Authentication getAuthentication(String token) {
        String memberEmail = getEmail(token);
        PrincipalDetails principalDetails = (PrincipalDetails) principalDetailsService.loadUserByUsername(memberEmail);
        return new UsernamePasswordAuthenticationToken(principalDetails, null, principalDetails.getAuthorities());
    }
}
