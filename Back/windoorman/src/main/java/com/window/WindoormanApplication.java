package com.window;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WindoormanApplication {

	public static void main(String[] args) {
		SpringApplication.run(WindoormanApplication.class, args);
	}

}
