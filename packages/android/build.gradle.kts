plugins {
    `maven-publish`
    `java-library`
}

group = "io.nexus.design"
version = System.getenv("NEXUS_TOKEN_VERSION") ?: "0.1.0"

java {
    withSourcesJar()
}

publishing {
    publications {
        create<MavenPublication>("release") {
            from(components["java"])
        }
    }
    repositories {
        maven {
            name = "ConfiguredRepository"
            url = uri(System.getenv("MAVEN_REPOSITORY_URL") ?: layout.buildDirectory.dir("local-maven"))
            credentials {
                username = System.getenv("MAVEN_USERNAME")
                password = System.getenv("MAVEN_PASSWORD")
            }
        }
    }
}
