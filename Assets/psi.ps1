$baseUri = 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/753640/'
$files = @(
    @{
        Uri = "$baseUri/67c028f08abfafe50143627d5c883c68f22513ac.jpg"
        OutFile = '1.png'
    },
    @{
        Uri = "$baseUri/3a1c6a6919bf97267f776edabb63de67e31b0e37.jpg"
        OutFile = '2.png'
    },
    @{
        Uri = "$baseUri/7104099181f09e35da906c8444c966c6cb9372b5.jpg"
        OutFile = '3.png'
    },
    @{
        Uri = "$baseUri/089a5842678ec13ee9de0ba09f31bbf9d747d586.jpg"
        OutFile = '4.png'
    },    @{
        Uri = "$baseUri/a6f8e4e9f7c3716c95d97e631ff917a58d2fb264.jpg"
        OutFile = '5.png'
    },    @{
        Uri = "$baseUri/33b244a60509aec6cda7a4d38108f62a21082880.jpg"
        OutFile = '6.png'
    },    @{
        Uri = "$baseUri/b24b122f1af709b79f168561a8b13c9bf0e583fe.jpg"
        OutFile = '7.png'
    },    @{
        Uri = "$baseUri/a8a1390a2f2c7b9e381778623f4f5dec00bb1fb2.jpg"
        OutFile = '8.png'
    },    @{
        Uri = "$baseUri/0325d6fdb21125fad97f26976fe7b72ed3c426c4.jpg"
        OutFile = '9.png'
    },    @{
        Uri = "$baseUri/b5db5ec394478b634d1fdfdf2ac445038f44fcd3.jpg"
        OutFile = '10.png'
    },    @{
        Uri = "$baseUri/3044af0481d989ed4c3a3c53b5fa88bab3a20fa3.jpg"
        OutFile = '11.png'
    },    @{
        Uri = "$baseUri/5719caa35441d10b79e3ecb48102b673608eed73.jpg"
        OutFile = '12.png'
    },    @{
        Uri = "$baseUri/9e53f59ea34e5a6310dfab428e9de16878ac4cd7.jpg"
        OutFile = '13.png'
    },    @{
        Uri = "$baseUri/5c26776a45aad56b853e689057a28249b4b8f831.jpg"
        OutFile = '14.png'
    }
)

$jobs = @()

foreach ($file in $files) {
    $jobs += Start-ThreadJob -Name $file.OutFile -ScriptBlock {
        $params = $using:file
        Invoke-WebRequest @params
    }
}

Write-Host "Downloads started..."
Wait-Job -Job $jobs

foreach ($job in $jobs) {
    Receive-Job -Job $job
}