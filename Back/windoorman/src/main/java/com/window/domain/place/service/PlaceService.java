package com.window.domain.place.service;

import com.window.domain.member.entity.Member;
import com.window.domain.place.dto.PlaceDto;
import com.window.domain.place.entity.Place;
import com.window.domain.place.repository.PlaceRepository;
import com.window.global.exception.CustomException;
import com.window.global.exception.ExceptionResponse;
import com.window.global.util.MemberInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;
    public List<PlaceDto> getPlaces(Authentication authentication) {
        Member member = MemberInfo.getMemberInfo(authentication);
        List<Place> places = placeRepository.findAllByMemberId(member.getId()).orElseThrow(() ->new ExceptionResponse(CustomException.NOT_FOUND_MEMBER_EXCEPTION));

        List<PlaceDto> placeDtos = new ArrayList<>();

        for(Place place: places) {
            placeDtos.add(new PlaceDto(place.getId(), place.getName(), place.getAddress(), place.getDetailAddress(), place.getIsDefault()));
        }

        return placeDtos;
    }

    public Long registPlace(PlaceDto placeDto, Authentication authentication) {
        Member member = MemberInfo.getMemberInfo(authentication);

        Place place = Place.builder()
                .name(placeDto.getName())
                .address(placeDto.getAddress())
                .detailAddress(placeDto.getDetailAddress())
                .member(member)
                .isDefault(placeDto.getIsDefault())
                .build();


        placeRepository.save(place);

        return place.getId();
    }

    public Long updatePlace(PlaceDto placeDto) {

        Place place = placeRepository.findById(placeDto.getId()).orElseThrow(()->new ExceptionResponse(CustomException.NOT_FOUND_PLACE_EXCEPTION));
        place.updatePlace(placeDto);
        placeRepository.save(place);

        return place.getId();
    }

    public Long deletePlace(Long placeId) {
        placeRepository.deleteById(placeId);

        return placeId;
    }


}
