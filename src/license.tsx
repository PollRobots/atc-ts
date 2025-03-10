import React from "react";

type Props = {
  className?: string | undefined;
};

export function License({ className }: Props) {
  return (
    <div className={className}>
      <h1 className="text-2xl font-medium mb-4">License</h1>
      <div className="mb-4">
        <h2 className="text-lg font-medium">3-clause BSD License</h2>
        <div className="mb-2">
          Copyright (c) 1990, 1993 The Regents of the University of California.
          All rights reserved.
        </div>
        <div className="mb-2">
          This code is derived from software contributed to Berkeley by Ed
          James.
        </div>
        <div className="mb-2">
          Redistribution and use in source and binary forms, with or without
          modification, are permitted provided that the following conditions are
          met:
        </div>
        <ol className="mb-2 list-decimal list-outside pl-8">
          <li className="pl-4">
            Redistributions of source code must retain the above copyright
            notice, this list of conditions and the following disclaimer.
          </li>
          <li className="pl-4">
            Redistributions in binary form must reproduce the above copyright
            notice, this list of conditions and the following disclaimer in the
            documentation and/or other materials provided with the distribution.
          </li>
          <li className="pl-4">
            Neither the name of the University nor the names of its contributors
            may be used to endorse or promote products derived from this
            software without specific prior written permission.
          </li>
        </ol>
        <div className="mb-2 text-justify">
          THIS SOFTWARE IS PROVIDED BY THE REGENTS AND CONTRIBUTORS \`\`AS IS''
          AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
          THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
          PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS
          BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
          CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
          SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
          BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
          WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
          OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN
          IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
        </div>
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-medium">Original Author</h2>
        <div className="mb-2">
          Copyright (c) 1987 by Ed James, UC Berkeley. All rights reserved.
        </div>
        <div className="mb-2">
          Copy permission is hereby granted provided that this notice is
          retained on all partial or complete copies.
        </div>
        <div className="mb-2">
          For more info on this and all of my stuff, mail edjames@berkeley.edu.
        </div>
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-medium">Web Port</h2>
        <div className="mb-2">
          Copyright &copy; 2025 by Paul C Roberts. All rights reserved.
        </div>
        <div className="mb-2">
          Copy permission is hereby granted provided that this notice is
          retained on all partial or complete copies.
        </div>
        <div className="mb-2">
          For more info see{" "}
          <a
            href="https://pollrobots.com"
            className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
          >
            pollrobots.com
          </a>
        </div>
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-medium">Source Code</h2>
        <div className="mb-2">
          Source code can be found at{" "}
          <a
            href="https://github.com/pollrobots/atc-ts"
            className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
          >
            github.com/pollrobots/atc-ts
          </a>
        </div>
      </div>
    </div>
  );
}
