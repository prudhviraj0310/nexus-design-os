Pod::Spec.new do |s|
  s.name         = "NexusDesignTokens"
  s.version      = ENV.fetch("NEXUS_TOKEN_VERSION", "0.1.0")
  s.summary      = "Generated Nexus design-system tokens"
  s.homepage     = "https://github.com/prudhviraj0310/nexus-design-os"
  s.license      = { :type => "MIT", :file => "../../LICENSE" }
  s.source       = { :git => "https://github.com/prudhviraj0310/nexus-design-os.git", :tag => "v#{s.version}" }
  s.source_files = "Sources/NexusDesignTokens/**/*.swift"
  s.swift_version = "5.9"
end
