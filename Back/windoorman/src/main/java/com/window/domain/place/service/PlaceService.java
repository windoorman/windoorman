package com.window.domain.place.service;

import com.window.domain.member.entity.Member;
import com.window.domain.place.dto.PlaceDto;
import com.window.domain.place.entity.Place;
import com.window.domain.place.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;
//    private final MemberRepository memberRepository;

    public List<PlaceDto> getPlaces(Long memberId) {
        List<Place> places = placeRepository.findAllByMemberId(memberId).orElseThrow();

        List<PlaceDto> placeDtos = new ArrayList<>();

        for(Place place: places) {
            PlaceDto placeDto = new PlaceDto();
            placeDto.setId(place.getId());
            placeDto.setName(place.getName());
            placeDto.setAddress(place.getAddress());
        }

        return placeDtos;
    }

    public Long registPlace(PlaceDto placeDto, Long memberId) {
//        Member member = memberRepository.findById(memberId);
        Member member = new Member();

        Place place = Place.builder()
                .name(placeDto.getName())
                .address(placeDto.getAddress())
                .member(member)
                .build();


        placeRepository.save(place);

        return place.getId();
    }

    public Long updatePlace(PlaceDto placeDto, Long memberId) {
//        Member member = memberRepository.findById(memberId);
        Member member = new Member();
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
