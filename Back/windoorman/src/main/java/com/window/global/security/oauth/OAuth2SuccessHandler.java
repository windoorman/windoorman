package com.window.global.security.oauth;

import com.window.domain.member.entity.Member;
import com.window.global.security.auth.PrincipalDetails;
import com.window.global.security.jwt.JwtTokenProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        Member member = ((PrincipalDetails) authentication.getPrincipal()).getMember();

        String accessToken = jwtTokenProvider.generateAccessToken(member);
        String refreshToken = jwtTokenProvider.generateRefreshToken(member);

        log.info("accessToken: {} refreshToken: {}", accessToken, refreshToken);

        String redirectUrl = UriComponentsBuilder.
                fromUriString("http://k11b107a.p.ssafy.io/token")
                .queryParam("access", accessToken)
                .queryParam("refresh", refreshToken)
                .build()
                .toString();

        response.setContentType("application/json");
        response.sendRedirect(redirectUrl);
    }
}
