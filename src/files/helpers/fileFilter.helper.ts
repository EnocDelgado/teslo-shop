

export const fileFilter = ( req: Express.Request, file: Express.Multer.File, callback: Function ) => {

    // validation
    if ( !file ) return callback( new Error('File is empty'), false );

    //
    const fileExeptension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if ( validExtensions.includes( fileExeptension ) ) {
        return callback( null, true );
    }

    callback( null, false );
}