package com.window.domain.place.controller;

import com.window.domain.place.dto.PlaceDto;
import com.window.domain.place.service.PlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/places")
public class PlaceController {

    private final PlaceService placeService;

    @GetMapping
    public ResponseEntity<?> getPlaces() {
        Long memberId = 1L;
        List<PlaceDto> places = placeService.getPlaces(memberId);
        return ResponseEntity.ok(places);
    }

    @PostMapping
    public ResponseEntity<?> registerPlace(@RequestBody PlaceDto place) {
        Long memberId = 1L;
        Long registeredPlaceId = placeService.registPlace(place, memberId);
        return ResponseEntity.ok(registeredPlaceId);
    }

    @PatchMapping
    public ResponseEntity<?> updatePlace(@RequestBody PlaceDto place) {
        Long memberId = 1L;
        Long registeredPlaceId = placeService.updatePlace(place, memberId);
        return ResponseEntity.ok(registeredPlaceId);
    }

    @DeleteMapping("/{placeId}")
    public ResponseEntity<?> deletePlace(@PathVariable("placeId") Long placeId) {
        Long deletedPlaceId = placeService.deletePlace(placeId);
        return ResponseEntity.ok(deletedPlaceId);
    }

}
