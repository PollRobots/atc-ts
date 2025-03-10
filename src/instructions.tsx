import React from "react";
import { twJoin } from "tailwind-merge";

type Props = {
  className?: string | undefined;
};

export function Instructions({ className }: Props) {
  return (
    <div className={className}>
      <Section title="Name">
        <Para>atc &mdash; air traffic controller game</Para>
      </Section>
      <Section title="Description">
        <Para>
          lets you try your hand at the nerve wracking duties of the air traffic
          controller without endangering the lives of millions of travelers each
          year. Your responsibilities require you to direct the flight of jets
          and prop planes into and out of the flight arena and airports. The
          speed (update time) and frequency of the planes depend on the
          difficulty of the chosen arena.
        </Para>
      </Section>
      <Section title="Goals">
        <Para>
          Your goal in <span>atc</span> is to keep the game going as long as
          possible. There is no winning state, except to beat the times of other
          players. You will need to: launch planes at airports (by instructing
          them to increase their altitude); land planes at airports (by
          instructing them to go to altitude zero when exactly over the
          airport); and maneuver planes out of exit points.
        </Para>
        <Para>
          Several things will cause the end of the game. Each plane has a
          destination (see information area), and sending a plane to the wrong
          destination is an error. Planes can run out of fuel, or can collide.
          Collision is defined as adjacency in all three dimensions. A plane
          leaving the arena in any other way than through its destination exit
          is an error as well.
        </Para>
        <Para>
          Scores are sorted in order of the number of planes safe. The other
          statistics are provided merely for fun. There is no penalty for taking
          longer than another player (except in the case of ties).
        </Para>
        <Para>
          Suspending a game is not permitted. If you get a talk message, tough.
          When was the last time an Air Traffic Controller got called away to
          the phone?
        </Para>
      </Section>
      <Section title="The display">
        <Para>The screen is divided into 4 areas.</Para>
        <Section title="Radar">
          <Para>
            The first screen area is the radar display, showing the relative
            locations of the planes, airports, standard entry/exit points, radar
            beacons, and &ldquo;lines&rdquo; which simply serve to aid you in
            guiding the planes.
          </Para>
          <Para>
            Planes are shown as a single letter with an altitude. If the
            numerical altitude is a single digit, then it represents thousands
            of feet. Some distinction is made between the prop planes and the
            jets. On ascii terminals, prop planes are represented by a upper
            case letter, jets by a lower case letter.
          </Para>
          <Para>
            Airports are shown as a number and some indication of the direction
            planes must be going to land at the airport. The planes will also
            take off in this direction.
          </Para>
          <Para>
            Beacons are represented as circles or asterisks and a number. Their
            purpose is to offer a place of easy reference to the plane pilots.
            See <a href="#The delay command">THE DELAY COMMAND</a> section
            below.
          </Para>
          <Para>
            Entry/exit points are displayed as numbers along the border of the
            radar screen. Planes will enter the arena from these points without
            warning. These points have a direction associated with them, and
            planes will always enter the arena from this direction. This
            direction is not displayed. It will become apparent what this
            direction is as the game progresses.
          </Para>
          <Para>
            Incoming planes will always enter at the same altitude: 7,000 feet.
            For a plane to successfully depart through an entry/exit point, it
            must be flying at 9,000 feet. It is not necessary for the planes to
            be flying in any particular direction when they leave the arena.
          </Para>
        </Section>
        <Section title="Information area">
          <Para>
            The second area of the display is the information area, which lists
            the time (number of updates since start), and the number of planes
            you have directed safely out of the arena. Below this is a list of
            planes currently in the air, followed by a blank line, and then a
            list of planes on the ground (at airports). Each line lists the
            plane name and its current altitude, an optional asterisk indicating
            low fuel, the plane&rsquo;s destination, and the plane&rsquo;s
            current command. Changing altitude is not considered to be a command
            and is therefore not displayed. The following are some possible
            information lines:
          </Para>
          <pre>
            B4*A0: Circle @ b1
            <br />
            g7 E4: 225
          </pre>
          <Para>
            The first example shows a prop plane named &lsquo;B&rsquo; that is
            flying at 4,000 feet. It is low on fuel (note the &lsquo;*&rsquo;).
            Its destination is Airport #0. The next command it expects to do is
            circle when it reaches Beacon #1. The second example shows a jet
            named &lsquo;g&rsquo; at 7,000 feet, destined for Exit #4. It is
            just now executing a turn to 225 degrees (South-West).
          </Para>
        </Section>
        <Section title="input area">
          <Para>
            The third area of the display is the input area. It is here that
            your input is reflected. See the <a href="#Input">INPUT</a> heading
            of this manual for more details.
          </Para>
        </Section>
        <Section title="Author area">
          <Para>
            This area is used simply to give credit where credit is due. :-)
          </Para>
        </Section>
      </Section>
      <Section title="Input">
        <Para>
          A command completion interface is built into the game. At any time,
          typing &lsquo;?&rsquo; will list possible input characters. Typing a
          backspace (your erase character) backs up, erasing the last part of
          the command. When a command is complete, a return enters it, and any
          semantic checking is done at that time. If no errors are detected, the
          command is sent to the appropriate plane. If an error is discovered
          during the check, the offending statement will be underscored and a
          (hopefully) descriptive message will be printed under it.
        </Para>
        <Para>
          The command syntax is broken into two parts: <em>Immediate Only</em>{" "}
          and <em>Delayable</em> commands. <em>Immediate Only</em> commands
          happen on the next update. <em>Delayable</em> commands also happen on
          the next update unless they are followed by an optional predicate
          called the <em>Delay</em> command.
        </Para>
        <Para>
          In the following tables, the syntax <em>[0-9]</em> means any single
          digit, and <em>&lt;dir&gt;</em> refers to a direction, given by the
          keys around the &lsquo;s&rsquo; key: &ldquo;wedcxzaq&rdquo;. In
          absolute references, &lsquo;q&rsquo; refers to North-West or 315
          degrees, and &lsquo;w&rsquo; refers to North, or 0 degrees. In
          relative references, &lsquo;q&rsquo; refers to -45 degrees or 45
          degrees left, and &lsquo;w&rsquo; refers to 0 degrees, or no change in
          direction.
        </Para>
        <Para>
          All commands start with a plane letter. This indicates the recipient
          of the command. Case is ignored.
        </Para>
        <Section title="Immediate only commands">
          <dl>
            <Term>
              a [ cd+- ] <em>number</em>
            </Term>
            <Desc>
              Altitude: Change a plane&rsquo;s altitude, possibly requesting
              takeoff. &lsquo;+&rsquo; and &lsquo;-&rsquo; are the same as
              &lsquo;c&rsquo; and &lsquo;d&rsquo;.
              <dl>
                <Term>
                  a <em>number</em>
                </Term>
                <Desc>
                  Climb or descend to the given altitude (in thousands of feet).
                </Desc>
                <Term>
                  ac <em>number</em>
                </Term>
                <Desc>Climb: relative altitude change.</Desc>
                <Term>
                  ad <em>number</em>
                </Term>
                <Desc>Descend: relative altitude change.</Desc>
              </dl>
            </Desc>
            <Term>m</Term>
            <Desc>
              Mark: Display in highlighted mode. Plane and command information
              is displayed normally.
            </Desc>
            <Term>i</Term>
            <Desc>
              Ignore: Do not display highlighted. Command is displayed as a line
              of dashes if there is no command.
            </Desc>
            <Term>u</Term>
            <Desc>
              Unmark: Same as ignore, but if a delayed command is processed, the
              plane will become marked. This is useful if you want to forget
              about a plane during part, but not all, of its journey.
            </Desc>
          </dl>
        </Section>
        <Section title="Delayable commands">
          <dl>
            <Term>c [ lr ]</Term>
            <Desc>
              Circle: Have the plane circle.
              <dl>
                <Term>cl</Term>
                <Desc>Circle counterclockwise.</Desc>
                <Term>cr</Term>
                <Desc>Circle clockwise (default).</Desc>
              </dl>
              <Term>
                t [ l-r+LR ] [ &lt;dir&gt; ] or tt [ abe* ] <em>number</em>
              </Term>
            </Desc>
            <Desc>
              Turn: Change direction.
              <dl>
                <Term>t &lt;dir&gt;</Term>
                <Desc>
                  Turn to direction: Turn to the absolute compass heading given.
                  The shortest turn will be taken.
                </Desc>
                <Term>tl &lt;dir&gt;</Term>
                <Desc>
                  Left: Turn counterclockwise: 45 degrees by default, or the
                  amount specified in &lt;dir&gt; (not <em>to</em> &lt;dir&gt;.)
                  &lsquo;w&rsquo; (0 degrees) is no turn. &lsquo;e&rsquo; is 45
                  degrees; &lsquo;q&rsquo; gives -45 degrees counterclockwise,
                  that is, 45 degrees clockwise.
                </Desc>
                <Term>t- &lt;dir&gt;</Term>
                <Desc>Same as left.</Desc>
                <Term>tr &lt;dir&gt;</Term>
                <Desc>
                  Right: Turn clockwise, 45 degrees by default, or the amount
                  specified in &lt;dir&gt;.
                </Desc>
                <Term>t+ &lt;dir&gt;</Term>
                <Desc>Same as right.</Desc>
                <Term>tL</Term>
                <Desc>Hard left: Turn counterclockwise 90 degrees.</Desc>
                <Term>tR</Term>
                <Desc>Hard right: Turn clockwise 90 degrees.</Desc>
                <Term>tt [abe*]</Term>
                <Desc>
                  Towards: Turn towards a beacon, airport or exit. The turn is
                  just an estimate.
                  <dl>
                    <Term>
                      tta <em>number</em>
                    </Term>
                    <Desc>Turn towards the given airport.</Desc>
                    <Term>
                      ttb <em>number</em>
                    </Term>
                    <Desc>Turn towards the specified beacon.</Desc>
                    <Term>
                      tte <em>number</em>
                    </Term>
                    <Desc>Turn towards an exit.</Desc>
                    <Term>
                      tt* <em>number</em>
                    </Term>
                    <Desc>Same as ttb.</Desc>
                  </dl>
                </Desc>
              </dl>
            </Desc>
          </dl>
        </Section>
        <Section title="The delay command">
          The <em>Delay</em> (a/@) command may be appended to any{" "}
          <em>Delayable</em> command. It allows the controller to instruct a
          plane to do an action when the plane reaches a particular beacon (or
          other objects in future versions).
          <dl>
            <Term>
              ab <em>number</em>
            </Term>
            <Desc>
              Do the delayable command when the plane reaches the specified
              beacon. The &lsquo;b&rsquo; for &ldquo;beacon&rdquo; is redundant
              to allow for expansion. &lsquo;@&rsquo; can be used instead of
              &lsquo;a&rsquo;.
            </Desc>
          </dl>
        </Section>
        <Section title="Marking, unmarking, and ignoring">
          <Para>
            Planes are <em>marked</em> by default when they enter the arena.
            This means they are displayed in highlighted mode on the radar
            display. A plane may also be either <em>unmarked</em> or{" "}
            <em>ignored</em>. An <em>ignored</em> plane is drawn in
            unhighlighted mode, and a line of dashes is displayed in the command
            field of the information area. The plane will remain this way until
            a mark command has been issued. Any other command will be issued,
            but the command line will return to a line of dashes when the
            command is completed.
          </Para>
          <Para>
            An <em>unmarked</em> plane is treated the same as an{" "}
            <em>ignored</em> plane, except that it will automatically switch to{" "}
            <em>marked</em> status when a delayed command has been processed.
            This is useful if you want to forget about a plane for a while, but
            its flight path has not yet been completely set.
          </Para>
          <Para>
            As with all of the commands, marking, unmarking and ignoring will
            take effect at the beginning of the next update. Do not be surprised
            if the plane does not immediately switch to unhighlighted mode.
          </Para>
        </Section>
        <Section title="Examples">
          <dl>
            <Term>atlab1</Term>
            <Desc>Plane A: turn left at beacon #1</Desc>
            <Term>cc</Term>
            <Desc>Plane C: circle</Desc>
            <Term>gtte4ab2</Term>
            <Desc>Plane G: turn towards exit #4 at beacon #2</Desc>
            <Term>ma+2</Term>
            <Desc>Plane M: altitude: climb 2,000 feet</Desc>
            <Term>stq</Term>
            <Desc>Plane S: turn to 315</Desc>
            <Term>xi</Term>
            <Desc>Plane X: ignore</Desc>
          </dl>
        </Section>
      </Section>
      <Section title="Other information">
        <ul className="list-disc list-outside pl-4">
          <li>
            Jets (lowercase) move every update; prop planes (uppercase) move
            every other update.
          </li>
          <li>All planes turn at most 90 degrees per movement.</li>
          <li>Planes enter at 7,000 feet and leave at 9,000 feet.</li>
          <li>
            Planes flying at an altitude of 0 crash if they are not over an
            airport.
          </li>
          <li>
            Planes waiting at airports can only be told to take off (climb in
            altitude).
          </li>
          <li>
            Pressing return (that is, entering an empty command) will perform
            the next update immediately. This allows you to &ldquo;fast
            forward&rdquo; the game clock if nothing interesting is happening.
          </li>
        </ul>
      </Section>
      <Section title="Author">
        <Para>
          Ed James, UC Berkeley: edjames@ucbvax.berkeley.edu, ucbvax!edjames
        </Para>
        <Para>
          This game is based on someone&rsquo;s description of the overall
          flavor of a game written for some unknown PC many years ago, maybe.
        </Para>
        <Para>This has been ported to the web by Paul C Roberts.</Para>
      </Section>
    </div>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

const DepthContext = React.createContext(0);

function Section({ title, children }: SectionProps) {
  const depth = React.useContext(DepthContext);
  return (
    <div id={title} className={depth == 0 ? "mb-4" : "ml-4"}>
      <DepthContext.Provider value={depth + 1}>
        <SectionTitle>{title}</SectionTitle>
        {children}
      </DepthContext.Provider>{" "}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  const depth = React.useContext(DepthContext);
  return (
    <div
      className={twJoin(
        "font-medium",
        depth == 1 ? "text-xl uppercase" : "text-lg capitalize"
      )}
    >
      {children}
    </div>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return <div className="mb-2">{children}</div>;
}

function Term({ children }: { children: React.ReactNode }) {
  return <dt className="font-mono">{children}</dt>;
}

function Desc({ children }: { children: React.ReactNode }) {
  return <dd className="mb-1 ml-4">{children}</dd>;
}
