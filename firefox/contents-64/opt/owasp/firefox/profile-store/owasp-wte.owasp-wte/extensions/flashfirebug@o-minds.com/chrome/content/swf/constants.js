const BLEND_MODES = [
	'Normal',
	'Normal',
	'Layer',
	'Multiply',
	'Screen',
	'Lighten',
	'Darken',
	'Difference',
	'Add',
	'Subtract',
	'Invert',
	'Alpha',
	'Erase',
	'Overlay',
	'Hardlight'
]
const PROPERTIES = [
	'_x',
	'_y',
	'_xscale',    
	'_yscale',
	'_currentframe',
	'_totalframes',
	'_alpha',
	'_visible',
	'_width',
	'_height',
	'_rotation',
	'_target',
	'_framesloaded',
	'_name',
	'_droptarget',
	'_url',
	'_highquality',
	'_focusrect',
	'_soundbuftime',
	'_quality',
	'_xmouse',
	'_ymouse'
];
const PRODUCTS = [
	"unknown", // 0
	"Macromedia Flex for J2EE",
	"Macromedia Flex for .NET",    
	"Adobe Flex",
];
const EDITIONS = [
	"Developer Edition", // 0       
	"Full Commercial Edition", // 1 
	"Non-Commercial Edition", // 2
	"Educational Edition", // 3
	"NFR Edition", // 4
	"Trial Edition", // 5
	""      // 6 no edition
];

const SoundCompression = {
	UNCOMPRESSED_NATIVE_ENDIAN:0,
	ADPCM:1,
	MP3:2,
	UNCOMPRESSED_LITTLE_ENDIAN:3,
	NELLYMOSER_16_KHZ:4,
	NELLYMOSER_8_KHZ:5,
	NELLYMOSER:6,
	SPEEX:11
}

const SoundCompressionLabel = [
	'Uncompressed Native Endian',
	'ADPCM',
	'MP3',
	'Uncompresed Little Endian',
	'Nellymoser 16 kHz',
	'Nellymoser 8 kHz',
	'Nellymoser',
	null,
	null,
	null,
	null,
	'Speex'
]

const SoundRate = [
	'5.5 kHz',
	'11 kHz',
	'22 kHz',
	'44 kHz'
]

const SoundSize = [
	'8 bit',
	'16 bit'
]

const SoundType = [
	'Mono',
	'Stereo'
]

var SpreadModes = {
	PAD: 0,
	REFLECT: 1,
	REPEAT: 2,
	RESERVED: 3
};

var InterpolationModes = {
	RGB: 0,
	LINEAR_RGB: 1,
	RESERVED1: 2,
	RESERVED2: 3
};

var FillStyleTypes = {
	SOLID: 0x00, 
	LINEAR_GRADIENT: 0x10, 
	RADIAL_GRADIENT: 0x12,
	FOCAL_RADIAL_GRADIENT: 0x13,
	REPEATING_BITMAP: 0x40, 
	CLIPPED_BITMAP: 0x41, 
	NON_SMOOTHED_REPEATING_BITMAP: 0x42,
	NON_SMOOTHED_CLIPPED_BITMAP: 0x43
};

const CapStyle = [
	'Round Cap',
	'No Cap',
	'Square Cap'
]

const JoinStyle = [
	'Round Join',
	'Bevel Join',
	'Miter Join'
]

var StyleChangeStates = {
	MOVE_TO: 0x01,
	LEFT_FILL_STYLE: 0x02,
	RIGHT_FILL_STYLE: 0x04,
	LINE_STYLE: 0x08,
	NEW_STYLES: 0x10
};

const LanguageCodes = [
	null,
	'Latin',
	'Japanese',
	'Korean',
	'Simplified Chinese',
	'Traditional Chinese'
]

const BitmapFormat = {
	BIT_8: 3,
	BIT_15: 4,
	BIT_24: 5
}

const VideoSmoothing = [
	'Smoothing off (faster)',
	'Smoothing on (higher quality)'
]

const VideoCodecID = [
	null,
	'JPEG',
	'Sorenson H.263',
	'Screen video',
	'On2 VP6',
	'On2 VP6 video with alpha channel',
	'Screen video version 2',
	'AVC (H.264)'
]

const VideoDeblockingType = [
	'Use VIDEOPACKET value',
	'Off',
	'Level 1 (Fast deblocking filter)',
	'Level 2 (VP6 only, better deblocking filter)',
	'Level 3 (VP6 only, better deblocking plus fast deringing filter)',
	'Level 4 (VP6 only, better deblocking plus better deringing filter)',
	'Reserved',
	'Reserved'
]

const Align = [
	'Left',
	'Right',
	'Center',
	'Justify'
]

const SendVars = [
	'None',
	'GET',
	'POST'
]