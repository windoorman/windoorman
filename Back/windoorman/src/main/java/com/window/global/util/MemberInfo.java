package com.window.global.util;

import com.window.domain.member.entity.Member;
import com.window.global.security.auth.PrincipalDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class MemberInfo {
    public static Member getMemberInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ((PrincipalDetails) authentication.getPrincipal()).getMember();
    }
}
