require 'rake/clean'

VERSION_FILES = %w(
    src/injected.coffee
    LiveReload.safariextension/Info.plist
    Chrome/LiveReload/manifest.json
    Firefox/install.rdf
)

def coffee dst, src
    sh 'coffee', '-c', '-b', '-o', File.dirname(dst), src
end

def concat dst, *srcs
    text = srcs.map { |src| File.read(src).rstrip + "\n" }
    File.open(dst, 'w') { |f| f.write text }
end

def version
    File.read('VERSION').strip
end

def subst_version_refs_in_file file, ver
    puts file
    orig = File.read(file)
    prev_line = ""
    anything_matched = false
    data = orig.lines.map do |line|
        if line =~ /\d\.\d\.\d/ && (line =~ /version/i || prev_line =~ /CFBundleShortVersionString|CFBundleVersion/)
            anything_matched = true
            new_line = line.gsub /\d\.\d\.\d/, ver
            puts "    #{new_line.strip}"
        else
            new_line = line
        end
        prev_line = line
        new_line
    end.join('')

    raise "Error: no substitutions made in #{file}" unless anything_matched

    File.open(file, 'w') { |f| f.write data }
end


file 'LiveReload.safariextension/global.js' => ['src/global.coffee'] do |task|
    coffee task.name, task.prerequisites.first
end

file 'LiveReload.safariextension/global-safari.js' => ['src/global-safari.coffee'] do |task|
    coffee task.name, task.prerequisites.first
end

file 'interim/injected.js' => ['src/injected.coffee'] do |task|
    coffee task.name, task.prerequisites.first
end

file 'interim/injected-safari.js' => ['src/injected-safari.coffee'] do |task|
    coffee task.name, task.prerequisites.first
end

file 'interim/injected-chrome.js' => ['src/injected-chrome.coffee'] do |task|
    coffee task.name, task.prerequisites.first
end

file 'LiveReload.safariextension/injected.js' => ['interim/injected.js', 'interim/injected-safari.js'] do |task|
    concat task.name, *task.prerequisites
end

file 'Chrome/LiveReload/global.js' => ['src/global.coffee'] do |task|
    coffee task.name, task.prerequisites.first
end

file 'Chrome/LiveReload/global-chrome.js' => ['src/global-chrome.coffee'] do |task|
    coffee task.name, task.prerequisites.first
end

file 'Chrome/LiveReload/injected.js' => ['interim/injected.js', 'interim/injected-chrome.js'] do |task|
    concat task.name, *task.prerequisites
end

file 'Firefox/content/global.js' => ['src/global.coffee'] do |task|
    coffee task.name, task.prerequisites.first
end
file 'Firefox/content/injected.js' => ['src/injected.coffee'] do |task|
    coffee task.name, task.prerequisites.first
end
file 'Firefox/content/firefox.js' => ['src/firefox.coffee'] do |task|
    coffee task.name, task.prerequisites.first
end

FIREFOX_SRC = FileList['Firefox/**/*.{js,xul,manifest,rdf,png}']
FIREFOX_SRC.include %w(Firefox/content/global.js Firefox/content/injected.js Firefox/content/firefox.js)

file "dist/LiveReload-#{version}.xpi" => FIREFOX_SRC do |task|
end

desc "Build Firefox extension"
task :firefox => FIREFOX_SRC do |task|
    dest = "dist/LiveReload-#{version}.xpi"
    full_dest = File.expand_path(dest)
    rm full_dest if File.exists?(full_dest)
    Dir.chdir 'Firefox' do
        sh 'zip', full_dest, *task.prerequisites.map { |f| f.sub(%r!^Firefox/!, '') }
    end
    sh 'open', '-R', full_dest
end

desc "Pack Chrome extension"
task :chrome => :build do |task|
    full_ext = File.expand_path('Chrome/LiveReload')
    full_pem = File.expand_path('Chrome/LiveReload.pem')
    sh '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        "--pack-extension=#{full_ext}", "--pack-extension-key=#{full_pem}"
    mv "Chrome/LiveReload.crx", "dist/LiveReload-#{version}.crx"
    sh 'open', '-R', File.expand_path("dist/LiveReload-#{version}.crx")
end


desc "Embed version number where it belongs"
task :version do
    ver = version
    VERSION_FILES.each { |file| subst_version_refs_in_file(file, ver) }
    Rake::Task[:build].invoke
end

desc "Increase version number"
task :bump do
    prev = version
    components = File.read('VERSION').strip.split('.')
    components[-1] = (components[-1].to_i + 1).to_s
    File.open('VERSION', 'w') { |f| f.write "#{components.join('.')}\n" }
    puts "#{prev} => #{version}"
    Rake::Task[:version].invoke
end

desc "Build all files"
task :build => [
    'LiveReload.safariextension/global.js',
    'LiveReload.safariextension/global-safari.js',
    'LiveReload.safariextension/injected.js',
    'Chrome/LiveReload/global.js',
    'Chrome/LiveReload/global-chrome.js',
    'Chrome/LiveReload/injected.js',
    'Firefox/content/global.js',
    'Firefox/content/injected.js',
    'Firefox/content/firefox.js',
]

desc "Upload the given build to S3"
task :upload do |t, args|
    require 'rubygems'
    require 'highline'
    HighLine.new.choose do |menu|
        menu.prompt = "Please choose a file to upload: "
        menu.choices(*Dir['dist/*.{crx,safariextz,xpi}'].map { |f| File.basename(f) }) do |file|
            path = "dist/#{file}"
            sh 's3cmd', '-P', 'put', path, "s3://download.livereload.com/#{file}"
            puts "http://download.livereload.com/#{file}"
        end
    end
end

desc "Tag the current version"
task :tag do
    sh 'git', 'tag', "v#{version}"
end
desc "Move (git tag -f) the tag for the current version"
task :retag do
    sh 'git', 'tag', '-f', "v#{version}"
end

task :default => :build

CLEAN.push *[
    'interim/injected.js',
    'interim/injected-safari.js',
    'interim/injected-chrome.js',
]
CLOBBER.push *[
    'LiveReload.safariextension/global.js',
    'LiveReload.safariextension/global-safari.js',
    'LiveReload.safariextension/injected.js',
    'Chrome/LiveReload/global.js',
    'Chrome/LiveReload/global-chrome.js',
    'Chrome/LiveReload/injected.js',
]