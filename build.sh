#!/bin/bash
set -e

# Install Deno
curl -fsSL https://deno.land/install.sh | sh
export DENO_INSTALL="$HOME/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"

# Run build
deno task build
