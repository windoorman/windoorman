package com.window.domain.place.service;

import com.window.domain.member.entity.Member;
import com.window.domain.place.dto.PlaceDto;
import com.window.domain.place.entity.Place;
import com.window.domain.place.repository.PlaceRepository;
import com.window.global.util.MemberInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;
//    private final MemberRepository memberRepository;

    public List<PlaceDto> getPlaces() {
        Member member = MemberInfo.getMemberInfo();
        List<Place> places = placeRepository.findAllByMemberId(member.getId()).orElseThrow();

        List<PlaceDto> placeDtos = new ArrayList<>();

        for(Place place: places) {
            PlaceDto placeDto = new PlaceDto();
            placeDto.setId(place.getId());
            placeDto.setName(place.getName());
            placeDto.setAddress(place.getAddress());
        }

        return placeDtos;
    }

    public Long registPlace(PlaceDto placeDto) {
        Member member = MemberInfo.getMemberInfo();

        Place place = Place.builder()
                .name(placeDto.getName())
                .address(placeDto.getAddress())
                .member(member)
                .build();


        placeRepository.save(place);

        return place.getId();
    }

    public Long updatePlace(PlaceDto placeDto) {

        Place place = placeRepository.findById(placeDto.getId()).orElseThrow();
        place.updatePlace(placeDto);
        placeRepository.save(place);

        return place.getId();
    }

    public Long deletePlace(Long placeId) {
        placeRepository.deleteById(placeId);


        return placeId;
    }


}
