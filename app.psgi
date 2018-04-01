#!/usr/bin/env perl

use strict;
use warnings;

use lib 'lib';
use feature 'say';

# TODO: move to the tools pm?
use constant DEBUG => $ENV{DEBUG} // $ENV{PLACK_ENV} // '' eq 'development';

use if DEBUG, 'Data::Dumper';

my %static_files = (
    '/'                     => {fn => 'index.html', headers => ['Content-Type' => 'text/html; charset=utf-8']},
    '/bunny.png'            => 0,
    '/carrot.png'           => 0,
    '/dead_bunny.png'       => 0,
    '/circle.png'           => 0,
    '/turret.png'           => 0,
    '/turret_gun.png'       => 0,
    '/gradient.png'         => 0,
    '/ray.png'              => 0,
    '/js/Character.js'      => 0,
    '/js/Construction.js'   => 0,
    '/js/Particle.js'       => 0,
    '/js/Enemy.js'          => 0,
    '/js/Game.js'           => 0,
    '/js/Dijkstras.js'      => 0,
    '/favicon.ico'          => 0,
);
 
sub {
    my $env = shift;

    if (exists $static_files{ $env->{PATH_INFO} }) {
        my $fn = $static_files{ $env->{PATH_INFO} } ? $static_files{ $env->{PATH_INFO} }->{fn} : './' . $env->{PATH_INFO};
        my $headers = $static_files{ $env->{PATH_INFO} } ? $static_files{ $env->{PATH_INFO} }->{headers} : [];
        open my $fh, '<' . $fn;
        return [200, $headers, $fh];
    }

    return [
        404,
        ['Content-Type' => 'text/plain; charset=utf-8'],
        ['Здесь рыбы нет']
    ];
};
