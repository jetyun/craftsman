/**
 * 
 */
package com.bigbata.craftsman.config.web;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.ViewResolver;
import org.springframework.web.servlet.config.annotation.DefaultServletHandlerConfigurer;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.view.InternalResourceViewResolver;

/**
 * 类说明:<br>
 * 创建时间: 2014年12月11日 上午10:37:32<br>
 * 
 * @author 刘岩松<br>
 * @email yansong.lau@gmail.com<br>
 */
@Configuration
@EnableWebMvc
@ComponentScan({ "com.bigbata.craftsman.web", "com.bigbata.craftsman.api" })
public class WebConfig extends WebMvcConfigurerAdapter {

	@Bean
	public ViewResolver viewResolver() {
		InternalResourceViewResolver resolver = new InternalResourceViewResolver();
		resolver.setPrefix("/WEB-INF/jsp/web/");
		resolver.setSuffix(".jsp");
		resolver.setExposeContextBeansAsAttributes(true);
		return resolver;
	}

	@Bean
	public PageableHandlerMethodArgumentResolver pageableHandlerResolver() {
		return new PageableHandlerMethodArgumentResolver();
	}

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/app/**").addResourceLocations("/app/");
		registry.addResourceHandler("/frame/**")
				.addResourceLocations("/frame/");
		registry.addResourceHandler("/vendor/**").addResourceLocations(
				"/vendor/");
	}

	@Override
	public void configureDefaultServletHandling(
			DefaultServletHandlerConfigurer configurer) {
		configurer.enable();
	}

	@Override
	public void addArgumentResolvers(
			List<HandlerMethodArgumentResolver> argumentResolvers) {

		// Extra argument resolvers (the default ones are added as well).
		argumentResolvers.add(pageableHandlerResolver());
	}

}
