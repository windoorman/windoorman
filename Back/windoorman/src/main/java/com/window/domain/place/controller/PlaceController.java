package com.window.domain.place.controller;

import com.window.domain.place.dto.PlaceDto;
import com.window.domain.place.service.PlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/places")
public class PlaceController {

    private final PlaceService placeService;

    @GetMapping
    public ResponseEntity<?> getPlaces(Authentication authentication) {
        List<PlaceDto> places = placeService.getPlaces(authentication);
        return ResponseEntity.ok(places);
    }

    @PostMapping
    public ResponseEntity<?> registerPlace(@RequestBody PlaceDto place, Authentication authentication) {
        Long registeredPlaceId = placeService.registPlace(place, authentication);
        return ResponseEntity.ok(registeredPlaceId);
    }

    @PatchMapping
    public ResponseEntity<?> updatePlace(@RequestBody PlaceDto place) {
        Long registeredPlaceId = placeService.updatePlace(place);
        return ResponseEntity.ok(registeredPlaceId);
    }

    @DeleteMapping("/{placeId}")
    public ResponseEntity<?> deletePlace(@PathVariable("placeId") Long placeId) {
        Long deletedPlaceId = placeService.deletePlace(placeId);
        return ResponseEntity.ok(deletedPlaceId);
    }

}