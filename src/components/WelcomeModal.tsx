import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  type: "subscriber" | "blog";
}

const messages = {
  subscriber: {
    title: "PRESS ROOM PUBLISHER Subscription Confirmation.",
    body: (
      <>
        <p>CONGRATULATIONS! This is to confirm your subscription to the domain of PRESS ROOM PUBLISHER. Welcome and thank you for your choice. Now, you would be able to access the comment section on every published publications, react officially to blogposts, report a published content, send direct message to publishers, and more related on PRESS ROOM PUBLISHER platform.</p>
        <p>Also, you'd be able to get new helpful notifications from the individual PRESS ROOM PUBLISHER Blogpost accounts you follow. We urge you to always leave a footprint of your presence each time you visit PRESS ROOM PUBLISHER domain. Be kind to follow the individual blogpost accounts of interest, widely share published publications, and do not deny us your valued thoughts responsibly in the comment section. We are much glad to have you join the PRESS ROOM PUBLISHER Community.</p>
      </>
    ),
  },
  blog: {
    title: "HEY VALUED PUBLISHER, YOUR NEW PRESS ROOM PUBLISHER BLOGPOST ACCOUNT HAS BEEN CREATED ACCORDINGLY. NOW YOUR DIGITAL PEN FIREPOWER IS ACTIVE HEREON.",
    body: (
      <>
        <p>CONGRATULATIONS! You have successfully created your new PRESS ROOM PUBLISHER Blogpost Account and we are glad to welcome you warmly to the community of publishers on the platform. Now you're good to go get started with varying social impacting TEXT, AUDIO & VISUAL posts that are engaging and equally making all round positive difference on the public.</p>
        <p>At PRESS ROOM PUBLISHER; we respectfully urge you to always remain professional as best possible in your publications. Kindly accord your esteemed readers and the valued followers of your PRP blogpost account the deserving regards and respect always. Be ethical and absolutely responsible in your overall conducts on PRESS ROOM PUBLISHER platform.</p>
        <p>Do keep in mind, the public is better informed, educated and entertained through your valued contributions to tirelessly make the world a better place. Hence, for no reason should you compromise the respected standard of professional journalism in your news reportage and other related writings you do on PRESS ROOM PUBLISHER platform.</p>
        <p>The public counts on the noble profession of Print Journalism and other related responsibilities. Certainly, our one JOB is PRESERVATION of the public TRUST. Therefore, kindly make it make sense in publication always.</p>
        <p>Again, you are most welcome to the domain of PRESS ROOM PUBLISHER. Let's go get the duty started and duly done consistently with your digital (PEN FIREPOWER) publishing facts without fear or favor!<br/>The Press Room Publisher Team.</p>
      </>
    ),
  },
};

export function WelcomeModal({ open, onClose, type }: WelcomeModalProps) {
  const { title, body } = messages[type];
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 text-base text-foreground/90 mt-2">{body}</div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} aria-label="Close welcome message">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
