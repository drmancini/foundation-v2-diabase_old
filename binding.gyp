{
    "targets": [
        {
            "target_name": "hashing",
            "sources": [
                "hashing.cc",
                "algorithms/sha256d/sha256d.c",
                "algorithms/sha256d/utils/sph_sha2.c",
                "algorithms/x11/x11.cpp",
                "algorithms/x11/utils/aes_helper.c",
                "algorithms/x11/utils/sph_blake.c",
                "algorithms/x11/utils/sph_bmw.c",
                "algorithms/x11/utils/sph_groestl.c",
                "algorithms/x11/utils/sph_jh.c",
                "algorithms/x11/utils/sph_keccak.c",
                "algorithms/x11/utils/sph_skein.c",
                "algorithms/x11/utils/sph_luffa.c",
                "algorithms/x11/utils/sph_cubehash.c",
                "algorithms/x11/utils/sph_shavite.c",
                "algorithms/x11/utils/sph_simd.c",
                "algorithms/x11/utils/sph_echo.c",
            ],
            "include_dirs": [
                ".",
                "<!(node -e \"require('nan')\")",
            ],
            "cflags_cc": [
                "-std=c++0x",
                "-fPIC",
                "-fexceptions"
            ],
            "defines": [
                "HAVE_DECL_STRNLEN=1",
                "HAVE_BYTESWAP_H=1"
            ],
            "link_settings": {
                "libraries": [
                    "-Wl,-rpath,./build/Release/",
                ]
            },
            'conditions': [
                ['OS=="mac"', {
                    'xcode_settings': {
                        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
                    }
                }]
            ]
        }
    ]
}
